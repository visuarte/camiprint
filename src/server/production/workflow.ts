// =============================================================================
// Workflow de producción — Revisión técnica y gestión de pedidos
// =============================================================================

import { prisma } from '@/server/db';

export type LineSource = 'roly' | 'stamina' | 'own_stock';
export type ProductionStatus = 'pending_review' | 'approved' | 'in_production' | 'completed' | 'shipped';

// ---- REVISIÓN TÉCNICA ----

export interface TechnicianReviewInput {
  productionOrderId: string;
  technicianId: string;
  technicianNotes?: string;
  estimatedDeliveryDate?: string;
  lines: Array<{
    source: LineSource;
    productSku: string;
    productName?: string;
    quantity: number;
    techniqueCode?: string;
    unitPrice?: number;
    notes?: string;
  }>;
}

/**
 * Obtiene las órdenes pendientes de revisión técnica
 */
export const getPendingReviewOrders = async () => {
  return prisma.productionOrder.findMany({
    where: { status: 'pending_review' },
    include: {
      lines: { include: { technique: true } },
      assets: true,
    },
    orderBy: { createdAt: 'asc' },
  });
};

/**
 * Aprueba una orden de producción tras la revisión técnica.
 * Crea las líneas de producción y marca la orden como "approved".
 */
export const approveProductionOrder = async (input: TechnicianReviewInput) => {
  const { productionOrderId, technicianId, technicianNotes, estimatedDeliveryDate, lines } = input;

  // 1. Buscar técnicas por código
  const techniqueMap = new Map<string, string>();
  for (const line of lines) {
    if (line.techniqueCode && !techniqueMap.has(line.techniqueCode)) {
      const tech = await prisma.printingTechnique.findUnique({
        where: { code: line.techniqueCode },
      });
      if (tech) techniqueMap.set(line.techniqueCode, tech.id);
    }
  }

  // 2. Crear líneas de producción
  for (const line of lines) {
    await prisma.productionOrderLine.create({
      data: {
        productionOrderId,
        source: line.source,
        productSku: line.productSku,
        productName: line.productName,
        quantity: line.quantity,
        techniqueId: line.techniqueCode ? techniqueMap.get(line.techniqueCode) : null,
        unitPrice: line.unitPrice,
        notes: line.notes,
        status: 'pending',
      },
    });
  }

  // 3. Actualizar la orden
  return prisma.productionOrder.update({
    where: { id: productionOrderId },
    data: {
      status: 'approved',
      reviewedBy: technicianId,
      reviewedAt: new Date(),
      technicianNotes,
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
    },
  });
};

/**
 * Calcula los proveedores necesarios y crea los pedidos a proveedores.
 * Separa las líneas por source (roly / stamina).
 */
export const splitOrderToSuppliers = async (productionOrderId: string) => {
  const lines = await prisma.productionOrderLine.findMany({
    where: { productionOrderId, status: 'pending' },
  });

  const grouped = new Map<LineSource, typeof lines>();

  for (const line of lines) {
    const source = line.source as LineSource;
    if (!grouped.has(source)) grouped.set(source, []);
    grouped.get(source)!.push(line);
  }

  const supplierOrders = [];

  for (const [supplier, supplierLines] of grouped) {
    const totalAmount = supplierLines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.quantity, 0);

    const order = await prisma.supplierOrder.create({
      data: {
        supplier,
        productionOrderId,
        status: 'pending',
        totalAmount: totalAmount > 0 ? totalAmount : null,
        lines: {
          create: supplierLines.map((l) => ({
            productSku: l.productSku,
            productName: l.productName,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        },
      },
      include: { lines: true },
    });

    // Marcar líneas como "ordered"
    await prisma.productionOrderLine.updateMany({
      where: { id: { in: supplierLines.map((l) => l.id) } },
      data: { status: 'ordered' },
    });

    supplierOrders.push(order);
  }

  // Actualizar estado de la orden
  await prisma.productionOrder.update({
    where: { id: productionOrderId },
    data: { status: 'in_production' },
  });

  return supplierOrders;
};

/**
 * Obtiene el detalle completo de una orden de producción
 */
export const getProductionOrderDetail = async (id: string) => {
  return prisma.productionOrder.findUnique({
    where: { id },
    include: {
      lines: { include: { technique: true } },
      assets: true,
      supplierOrders: { include: { lines: true } },
      tickets: true,
    },
  });
};
