import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { stripe } from '@/lib/stripe';
import { validateOrder } from '@/lib/validation';
import { ApiErrorHandler, createErrorResponse, createSuccessResponse } from '@/lib/error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = validateOrder(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { customerId, email, phone, address, items, total } = body;

    // Find or create customer
    let customer = null;
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
    }

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          name: email.split('@')[0], // Temporary name from email
          email,
          phone,
          address,
        },
      });
    }

    // Create order in database with status "pending"
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        email,
        phone,
        address,
        totalAmount: total,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe expects amount in cents
      currency: 'usd',
      description: `Order ${order.id} for ${email}`,
      metadata: {
        orderId: order.id,
        customerId: customer.id,
      },
    });

    // Update order with Stripe payment intent ID
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
        total: order.totalAmount,
        paymentIntentId: paymentIntent.id,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check admin auth header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || token !== process.env.ADMIN_AUTH_TOKEN) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const status = url.searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Query orders
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}
