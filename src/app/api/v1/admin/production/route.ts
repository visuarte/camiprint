import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { verifyAdminToken } from '@/app/api/admin/auth-utils';

type UnifiedStatus = 'PENDING_REVIEW' | 'IN_PRODUCTION' | 'QUALITY_CHECK' | 'READY_TO_SHIP' | 'INCIDENT' | 'COMPLETED';

const STATUS_ORDER: UnifiedStatus[] = ['PENDING_REVIEW', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY_TO_SHIP', 'COMPLETED'];

interface ProductionOrderItem {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  totalAmount: number;
  productionSource: 'local' | 'gor_factory' | 'hybrid';
  status: UnifiedStatus;
  originalStatus: string;
  itemsCount: number;
  totalQuantity: number;
  gorOrderRef: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  shippedAt: string | null;
  createdAt: string;
  designPreviewUrl: string | null;
  actions: string[];
}

function mapToUnifiedStatus(order: any): UnifiedStatus {
  const s = order.status?.toLowerCase() || '';

  // Local production statuses
  if (s === 'pending' || s === 'pending_review') return 'PENDING_REVIEW';
  if (s === 'paid' || s === 'in_production' || s === 'in_progress') return 'IN_PRODUCTION';
  if (s === 'quality_check' || s === 'qa_review') return 'QUALITY_CHECK';
  if (s === 'shipped' || s === 'ready_to_ship') return 'READY_TO_SHIP';
  if (s === 'delivered' || s === 'completed') return 'COMPLETED';
  if (s === 'cancelled' || s === 'incident') return 'INCIDENT';

  // Fallback by production source
  if (order.productionSource === 'gor_factory') {
    if (order.gorOrderRef && !order.trackingNumber) return 'IN_PRODUCTION';
    if (order.trackingNumber) return 'READY_TO_SHIP';
  }

  return 'PENDING_REVIEW';
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const source = searchParams.get('source'); // local | gor_factory | hybrid
  const status = searchParams.get('status');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));

  try {
    const where: any = {};
    if (source) where.productionSource = source;

    if (status) {
      // Map unified status back to DB statuses
      const statusMap: Record<string, string[]> = {
        PENDING_REVIEW: ['pending', 'pending_review'],
        IN_PRODUCTION: ['paid', 'in_production', 'in_progress'],
        QUALITY_CHECK: ['quality_check', 'qa_review'],
        READY_TO_SHIP: ['shipped', 'ready_to_ship'],
        INCIDENT: ['cancelled', 'incident'],
        COMPLETED: ['delivered', 'completed'],
      };
      where.status = { in: statusMap[status] || [status.toLowerCase()] };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: true,
          productionOrders: {
            include: { assets: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const items: ProductionOrderItem[] = (orders as any[]).map((order: any) => {
      const po = order.productionOrders?.[0];
      const designAsset = po?.assets?.[0];

      const unifiedStatus = mapToUnifiedStatus(order);
      const totalQty = order.items.reduce((sum: number, i: any) => sum + i.quantity, 0);

      return {
        id: order.id,
        orderId: order.id.slice(0, 8).toUpperCase(),
        customerName: order.customer?.name || order.email?.split('@')[0] || '-',
        email: order.email,
        phone: order.phone,
        address: order.address,
        totalAmount: order.totalAmount,
        productionSource: order.productionSource || 'local',
        status: unifiedStatus,
        originalStatus: order.status,
        itemsCount: order.items.length,
        totalQuantity: totalQty,
        gorOrderRef: order.gorOrderRef,
        trackingNumber: order.trackingNumber,
        trackingCarrier: order.trackingCarrier,
        shippedAt: order.shippedAt?.toISOString() || null,
        createdAt: order.createdAt.toISOString(),
        designPreviewUrl: designAsset?.storageKey || null,
        actions: unifiedStatus === 'COMPLETED' ? [] : ['sync'],
      };
    });

    return NextResponse.json({
      ok: true,
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      statuses: STATUS_ORDER,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
