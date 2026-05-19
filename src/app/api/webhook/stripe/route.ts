import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { emailService } from '@/server/emails/service';

const prisma = new PrismaClient();

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
      console.error('STRIPE_WEBHOOK_SECRET is not set');
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
      console.error('Webhook signature verification failed:', err.message);
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
        console.warn('Payment intent succeeded but no orderId in metadata');
        return NextResponse.json({ ok: true, id: event.id });
      }

      // Fetch full order data including items and customer
      const orderData = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });

      if (!orderData) {
        console.warn(`Order ${orderId} not found`);
        return NextResponse.json({ ok: true, id: event.id });
      }

      // Update order status to "paid"
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
        },
      });

      console.log(`Order ${orderId} marked as paid`);

      // Prepare order data for email template
      const orderConfirmationData = {
        orderNumber: orderId.substring(0, 8).toUpperCase(),
        customerName: orderData.customer.name || orderData.email.split('@')[0],
        items: orderData.items.map((item) => ({
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
          console.log(`Confirmation email sent to ${orderData.email} for order ${orderId}`);
        } else {
          console.warn(`Failed to send confirmation email for order ${orderId}, but payment was successful`);
        }
      } catch (emailError) {
        const err = emailError as Error;
        console.error(`Error sending confirmation email for order ${orderId}:`, err.message);
        // Don't throw - email is best-effort
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

        console.log(`Order ${orderId} marked as cancelled due to payment failure`);
      }
    }

    // Handle unknown events - log but don't fail
    if (event.type !== 'payment_intent.succeeded' && event.type !== 'payment_intent.payment_failed') {
      console.info(`Received webhook event: ${event.type} (not handled, but acknowledged)`);
    }

    // Return 200 OK to acknowledge webhook receipt to Stripe
    return NextResponse.json({ ok: true, id: event.id });
  } catch (error) {
    const err = error as Error;
    console.error('Webhook error:', err.message);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
