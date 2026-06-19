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
  const hasGorTechnique = items.some((i) =>
    i.technique && GOR_TECHNIQUES.includes(i.technique.toUpperCase())
  )
  const hasLocalTechnique = items.every((i) =>
    !i.technique || LOCAL_TECHNIQUES.includes(i.technique.toUpperCase())
  )

  // All items have Gor techniques → full outsourced
  if (hasGorTechnique && totalQuantity > 0) {
    return {
      source: 'gor_factory',
      reason: `Técnica requiere producción industrial (${items.filter(i => i.technique && GOR_TECHNIQUES.includes(i.technique.toUpperCase())).map(i => i.technique).join(', ')})`,
      localItems: [],
      gorItems: items,
      totalQuantity,
    }
  }

  // Total quantity exceeds threshold → outsourced
  if (totalQuantity >= LOCAL_THRESHOLD) {
    return {
      source: 'gor_factory',
      reason: `Volumen alto (${totalQuantity} uds ≥ ${LOCAL_THRESHOLD} umbral) — deriva a producción industrial`,
      localItems: [],
      gorItems: items,
      totalQuantity,
    }
  }

  // All items are local techniques → keep in-house
  if (hasLocalTechnique || !items.some((i) => i.technique)) {
    return {
      source: 'local',
      reason: `Volumen bajo (${totalQuantity} uds) con técnica DTF/Vinilo — producción en taller propio`,
      localItems: items,
      gorItems: [],
      totalQuantity,
    }
  }

  // Mixed: separate items
  const localItems = items.filter((i) =>
    !i.technique || LOCAL_TECHNIQUES.includes(i.technique.toUpperCase())
  )
  const gorItems = items.filter((i) =>
    i.technique && GOR_TECHNIQUES.includes(i.technique.toUpperCase())
  )

  return {
    source: 'hybrid',
    reason: `Producción dividida: ${localItems.length} ítems en taller, ${gorItems.length} ítems a fábrica`,
    localItems,
    gorItems,
    totalQuantity,
  }
}

export async function sendToGorFactory(
  orderId: string,
  items: OrderItemInput[],
  customer: CustomerInfo,
  designUrls: string[]
): Promise<string | null> {
  try {
    const gor = createGorFactory()

    // Fetch catalog to get GOR itemcodes
    const catalog = await gor.catalog.getCatalog('roly')
    const itemcodeMap = new Map<string, string>()
    for (const item of items) {
      const match = catalog.find((m: any) =>
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
    return null
  } catch (error) {
    console.error('[HybridRouter] Error sending to Gor Factory:', error)
    return null
  }
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

  // Create job ticket for the workshop
  if (source === 'local') {
    const { createJobTicket } = await import('@/engine/production/ticket-factory')
    await createJobTicket({
      productionOrderId: po.id,
      department: 'PRINTING',
      payload: { orderId, autoGenerated: true },
    })
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
