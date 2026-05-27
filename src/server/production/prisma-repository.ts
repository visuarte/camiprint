import { prisma } from "@/server/db";

// Local minimal types to avoid importing from engine/ (preserve layering)
type Department = 'PREPRESS' | 'PRINTING' | 'QA' | 'SHIPPING';

type ProductionOrder = {
  id: string;
  externalId?: string;
  customerId?: string;
  status: string;
  priority: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type DesignAsset = {
  id: string;
  productionOrderId?: string | null;
  filename: string;
  storageKey: string;
  mimeType?: string | null;
  size?: number | null;
  checksumSha256?: string | null;
  createdAt?: string | Date;
};

type JobTicket = {
  id: string;
  productionOrderId?: string | null;
  ticketNumber: number;
  department: string;
  status: string;
  payload?: any;
  createdAt?: string | Date;
};

type WorkQueueItem = {
  id: string;
  jobTicketId: string;
  department: string;
  status: string;
  position?: number;
  createdAt?: string | Date;
};

type QueueFilter = {
  department?: Department;
  status?: string;
  limit?: number;
  cursor?: string | null;
};

interface IProductionRepository {
  findOrder(id: string): Promise<ProductionOrder | null>;
  saveOrder(order: ProductionOrder): Promise<void>;
  saveAsset(asset: DesignAsset): Promise<void>;
  saveTicket(ticket: JobTicket): Promise<void>;
  saveQueueItem(item: WorkQueueItem): Promise<void>;
  getQueueItems(filter: QueueFilter): Promise<{ items: WorkQueueItem[]; nextCursor: string | null }>;
  countQueueItemsByDepartment(department: Department): Promise<number>;
  nextTicketSequence(): Promise<number>;
}

export class PrismaProductionRepository implements IProductionRepository {
  async findOrder(id: string) {
    const po = await prisma.productionOrder.findUnique({ where: { id } });
    if (!po) return null;
    return {
      id: po.id,
      externalId: po.externalId ?? undefined,
      customerId: po.customerId ?? undefined,
      status: po.status,
      priority: po.priority,
      createdAt: po.createdAt,
      updatedAt: po.updatedAt,
    } as ProductionOrder;
  }
  async saveOrder(order: ProductionOrder) {
    await prisma.productionOrder.upsert({
      where: { id: order.id },
      update: {
        externalId: order.externalId ?? null,
        customerId: order.customerId ?? null,
        status: order.status,
        priority: order.priority,
      },
      create: {
        id: order.id,
        externalId: order.externalId ?? null,
        customerId: order.customerId ?? null,
        status: order.status,
        priority: order.priority,
      },
    });
  }
  async saveAsset(asset: DesignAsset) {
    await prisma.designAsset.create({
      data: {
        id: asset.id,
        productionOrderId: (asset as any).productionOrderId ?? null,
        filename: asset.filename,
        storageKey: asset.storageKey,
        mimeType: asset.mimeType ?? null,
        size: asset.size ?? null,
        checksumSha256: asset.checksumSha256 ?? null,
      },
    });
  }
  async saveTicket(ticket: JobTicket) {
    await prisma.jobTicket.create({
      data: {
        id: ticket.id,
        productionOrderId: (ticket as any).productionOrderId ?? null,
        ticketNumber: ticket.ticketNumber,
        department: ticket.department,
        status: ticket.status,
        payload: ticket.payload ? JSON.stringify(ticket.payload) : null,
      },
    });
  }
  async saveQueueItem(item: WorkQueueItem) {
    await prisma.workQueueItem.create({
      data: {
        id: item.id,
        jobTicketId: item.jobTicketId,
        department: item.department,
        status: item.status,
        position: item.position ?? 0,
      },
    });
  }
  async getQueueItems(filter: QueueFilter) {
    const where: any = {};
    if (filter.department) where.department = filter.department;
    if (filter.status) where.status = filter.status;
    const limit = filter.limit ?? 50;
    const items = await prisma.workQueueItem.findMany({ where, take: limit, orderBy: { createdAt: 'asc' } });
    const nextCursor = items.length < limit ? null : items[items.length - 1].id;
    return { items: items as any as WorkQueueItem[], nextCursor };
  }
  async countQueueItemsByDepartment(department: Department) {
    const c = await prisma.workQueueItem.count({ where: { department } });
    return c;
  }
  async nextTicketSequence() {
    // simple implementation: count existing tickets + 1
    const c = await prisma.jobTicket.count();
    return c + 1;
  }
}

export const createPrismaProductionRepository = () => new PrismaProductionRepository();
