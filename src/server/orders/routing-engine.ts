import { prisma } from '@/server/db'
import { createGorFactory } from '@/server/integrations/gor-factory/factory'
import type { GorOrderPayload } from '@/server/integrations/gor-factory/types'

export type ProductionSource = 'local' | 'gor_factory' | 'hybrid'

const LOCAL_THRESHOLD = 50
const LOCAL_TECHNIQUES = ['DTF', 'VINILO']
const GOR_TECHNIQUES = ['SERIGRAFIA', 'SUBLIMACION', 'BORDADO']

export interface OrderItemInput {
  productId: string
  quantity: number
  price: number
  technique?: string
  designUrl?: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  city?: string
  postcode?: string
  state?: string
  country?: string
}

export interface RoutingDecision {
  source: ProductionSource
  reason: string
  localItems: OrderItemInput[]
  gorItems: OrderItemInput[]
  totalQuantity: number
}

export function decideRouting(items: OrderItemInput[]): RoutingDecision {
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)

  // Separate items by technique
  const gorItems = items.filter((i) =>
    i.technique && GOR_TECHNIQUES.includes(i.technique.toUpperCase())
  )
  const localItems = items.filter((i) =>
    !i.technique || LOCAL_TECHNIQUES.includes(i.technique.toUpperCase())
  )

  // If everything has no technique or local technique, check volume
  if (gorItems.length === 0) {
    if (totalQuantity >= LOCAL_THRESHOLD) {
      return {
        source: 'gor_factory',
        reason: `Volumen alto (${totalQuantity} uds ≥ ${LOCAL_THRESHOLD} umbral) — deriva a producción industrial`,
        localItems: [],
        gorItems: items,
        totalQuantity,
      }
    }
    return {
      source: 'local',
      reason: `Volumen bajo (${totalQuantity} uds) — producción en taller propio`,
      localItems: items,
      gorItems: [],
      totalQuantity,
    }
  }

  // Mixed: some items need industrial, others can be local
  if (localItems.length > 0) {
    return {
      source: 'hybrid',
      reason: `Producción dividida: ${localItems.length} ítems en taller, ${gorItems.length} ítems a fábrica`,
      localItems,
      gorItems,
      totalQuantity,
    }
  }

  // All items need industrial production
  return {
    source: 'gor_factory',
    reason: `Técnica requiere producción industrial (${gorItems.map(i => i.technique).join(', ')})`,
    localItems: [],
    gorItems: items,
    totalQuantity,
  }
}

export async function sendToGorFactory(
  orderId: string,
  items: OrderItemInput[],
  customer: CustomerInfo,
  designUrls: string[]
): Promise<string | null> {
  let lastError: string | null = null

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const gor = createGorFactory()
      const catalogResult = await gor.catalog.getCatalog('roly')
      const catalog = catalogResult.success && catalogResult.data ? catalogResult.data : []
      const itemcodeMap = new Map<string, string>()
      for (const item of items) {
        const match = (catalog as any[]).find((m: any) =>
          m.items?.some((i: any) => i.itemcode === item.productId || i.description?.includes(item.productId))
        )
        if (match) {
          const firstItem = match.items?.[0]
          if (firstItem) itemcodeMap.set(item.productId, firstItem.itemcode)
        }
      }

      const payload: GorOrderPayload = {
        deliveryaddress: {
          addressname: customer.name,
          address: customer.address,
          city: customer.city || 'Madrid',
          postcode: customer.postcode || '28001',
          state: customer.state || 'Madrid',
          country: customer.country || 'ES',
        },
        reference: orderId,
        comments: `Pedido ${orderId} - ${items.length} líneas. Diseños: ${designUrls.join(', ') || 'N/A'}`,
        lines: items.map((item) => ({
          itemcode: itemcodeMap.get(item.productId) || item.productId,
          quantity: String(item.quantity),
          warehouse: '01',
        })),
      }

      const result = await gor.orders.createOrder(payload)
      if (result.success && result.data?.orderNumber) {
        return result.data.orderNumber
      }
      lastError = result.error || 'GOR API returned unsuccessful'
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * attempt))
      }
    }
  }

  // All attempts failed — mark order for manual review
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'production_error' },
  }).catch(() => {})

  console.error(`[HybridRouter] Failed to send order ${orderId} to Gor Factory after 3 attempts: ${lastError}`)
  return null
}

export async function createProductionOrderAndTicket(
  orderId: string,
  source: ProductionSource,
  gorOrderRef: string | null
): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      productionSource: source,
      gorOrderRef,
    },
  })

  // Create a ProductionOrder record for tracking
  const po = await prisma.productionOrder.create({
    data: {
      orderId,
      customerId: (await prisma.order.findUnique({ where: { id: orderId }, select: { customerId: true } }))?.customerId || '',
      status: source === 'local' ? 'pending_review' : 'in_progress',
      technicianNotes: `Enrutado a: ${source === 'local' ? 'Taller propio (DTF/Vinilo)' : 'Gor Factory'}${gorOrderRef ? ` — Ref: ${gorOrderRef}` : ''}`,
    },
  })

  // Create job ticket for the workshop will be done from the admin dashboard
  if (source === 'local') {
    // ProductionOrder already created above — ticket creation is manual from /admin/production
  }
}

export async function updateTracking(
  orderId: string,
  trackingNumber: string,
  carrier: string
): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingNumber,
      trackingCarrier: carrier,
      shippedAt: new Date(),
      status: 'shipped',
    },
  })
}
