import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import Stripe from 'stripe';
import pino from 'pino';
import { stripe } from '@/lib/stripe';
import { emailService } from '@/server/emails/service';
import { generateJobSheet } from '@/server/production/jobsheet-generator';

const webhookLog = pino({ name: 'stripe-webhook', level: process.env.LOG_LEVEL || 'info' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        {
          error: 'Missing stripe-signature header',
        },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      webhookLog.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        {
          error: 'Webhook secret not configured',
        },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      const err = error as Error;
      webhookLog.error({ error: err.message }, 'Webhook signature verification failed');
      return NextResponse.json(
        {
          error: 'Invalid signature',
        },
        { status: 400 }
      );
    }

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (!orderId) {
        webhookLog.warn('Payment intent succeeded but no orderId in metadata');
        return NextResponse.json({ ok: true, id: event.id });
      }

      // Fetch full order data including items and customer
      const orderData = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } }, customer: true },
      });

      if (!orderData) {
        webhookLog.warn({ orderId }, 'Order not found for payment');
        return NextResponse.json({ ok: true, id: event.id });
      }

      // Verify amount matches — evitar fraude por metadata manipulation
      const expectedAmount = Math.round(orderData.totalAmount * 100);
      if (paymentIntent.amount_received !== expectedAmount) {
        webhookLog.error({ orderId, expected: expectedAmount, received: paymentIntent.amount_received }, 'PaymentIntent amount mismatch — possible fraud');
        return NextResponse.json({ ok: false, error: 'Amount mismatch' }, { status: 400 });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'paid' },
      });

      webhookLog.info({ orderId }, 'Order marked as paid');

      // Prepare order data for email template
      const orderConfirmationData = {
        orderNumber: orderId.substring(0, 8).toUpperCase(),
        customerName: orderData.customer.name || orderData.email.split('@')[0],
        items: orderData.items.map((item: typeof orderData.items[number]) => ({
          productName: item.product.name,
          quantity: item.quantity,
          size: item.product.size || 'N/A',
          price: item.price,
        })),
        total: orderData.totalAmount,
        shippingAddress: orderData.address,
        email: orderData.email,
      };

      // Send confirmation email (best-effort, don't fail webhook if email fails)
      try {
        const emailSent = await emailService.sendOrderConfirmation(
          orderData.email,
          orderConfirmationData
        );

        if (emailSent) {
          webhookLog.info({ orderId, email: orderData.email }, 'Confirmation email sent');
        } else {
          webhookLog.warn({ orderId }, 'Confirmation email send returned failure');
        }
      } catch (emailError) {
        const err = emailError as Error;
        webhookLog.error({ orderId, error: err.message }, 'Confirmation email send threw');
        // Don't throw - email is best-effort
      }

      // Auto-generate jobsheet for workshop
      try {
        const jobSheet = await generateJobSheet(orderId);
        webhookLog.info({ orderId, jobSheetId: jobSheet.jobSheetId, blobUrl: jobSheet.blobUrl }, 'JobSheet generated');
      } catch (jsError) {
        const err = jsError as Error;
        webhookLog.error({ orderId, error: err.message }, 'JobSheet generation failed');
        // Don't throw - jobsheet is best-effort
      }
    }

    // Handle payment_intent.payment_failed event
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'cancelled',
          },
        });

        webhookLog.info({ orderId }, 'Order marked as cancelled due to payment failure');
      }
    }

    // Handle unknown events - log but don't fail
    if (event.type !== 'payment_intent.succeeded' && event.type !== 'payment_intent.payment_failed') {
      webhookLog.info({ eventType: event.type }, 'Unhandled webhook event type');
    }

    // Return 200 OK to acknowledge webhook receipt to Stripe
    return NextResponse.json({ ok: true, id: event.id });
  } catch (error) {
    const err = error as Error;
    webhookLog.error({ error: err.message }, 'Unhandled webhook error');
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
