import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

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
        return NextResponse.json({ received: true });
      }

      // Update order status to "paid"
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
        },
      });

      console.log(`Order ${orderId} marked as paid`);

      // TODO: Send confirmation email
      // await sendConfirmationEmail(order.email, order);
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

    return NextResponse.json({ received: true });
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
