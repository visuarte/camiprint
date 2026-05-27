import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { stripe } from '@/lib/stripe';
import { CreateOrderSchema, type CreateOrderRequest } from '@/lib/validation';
import { jsonError, jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);

  const contentType = req.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/json')) {
    return jsonError(415, requestId, 'UNSUPPORTED_MEDIA_TYPE', 'El Content-Type debe ser application/json.');
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonError(422, requestId, 'INVALID_JSON', 'El body no es JSON válido.');
  }

  const parsed = CreateOrderSchema.safeParse(rawBody);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      issue: issue.message,
    }));
    return jsonError(422, requestId, 'VALIDATION_ERROR', 'Payload inválido.', details);
  }

  const { customerId, email, phone, address, items, total }: CreateOrderRequest = parsed.data;

  try {
    // Find or create customer
    let customer = customerId
      ? await prisma.customer.findUnique({ where: { id: customerId } })
      : null;

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: email.split('@')[0],
          email,
          phone,
          address,
        },
      });
    }

    // Create order with status "pending"
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        email,
        phone,
        address,
        totalAmount: total,
        status: 'pending',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'eur',
      description: `Pedido ${order.id} — ${email}`,
      metadata: {
        orderId: order.id,
        customerId: customer.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return jsonSuccess(201, requestId, {
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      total: order.totalAmount,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('stripe')) {
      return jsonError(502, requestId, 'PAYMENT_PROVIDER_ERROR', 'Error al crear el intento de pago.');
    }
    return jsonError(500, requestId, 'INTERNAL_ERROR', 'Error interno al crear el pedido.');
  }
}

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_AUTH_TOKEN) {
    return jsonError(401, requestId, 'UNAUTHORIZED', 'Token de autorización inválido o ausente.');
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)));
  const status = searchParams.get('status');

  const where: { status?: string } = {};
  if (status) where.status = status;

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, customer: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return jsonSuccess(200, requestId, {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return jsonError(500, requestId, 'INTERNAL_ERROR', 'Error al consultar pedidos.');
  }
}
