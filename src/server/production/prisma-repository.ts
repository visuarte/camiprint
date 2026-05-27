import { prisma } from "@/server/db";
import type {
  IProductionRepository,
  ProductionOrder,
  ProductionOrderStatus,
  DesignAsset as EngineDesignAsset,
  JobTicket as EngineJobTicket,
  WorkQueueItem as EngineWorkQueueItem,
  QueueFilter as EngineQueueFilter,
  Department as EngineDepartment,
} from "@/engine/production/types";

// Local minimal types to avoid importing from engine/ (preserve layering)
// Usamos las interfaces y tipos definidos por el Engine para asegurar compatibilidad.

export class PrismaProductionRepository implements IProductionRepository {
  async findOrder(id: string): Promise<ProductionOrder | null> {
    // productionOrder is not in Prisma schema — use raw query fallback
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(
        'SELECT id, customer_id, status, priority, created_at, updated_at FROM production_orders WHERE id = $1 LIMIT 1',
        id
      );
      if (!rows.length) return null;
      const po = rows[0];
      return {
        id: po.id,
        customerId: po.customer_id ?? undefined,
        status: (po.status ?? 'PENDING_ASSETS') as ProductionOrderStatus,
        priority: po.priority ?? 'NORMAL',
        createdAt: po.created_at ? new Date(po.created_at) : new Date(),
        updatedAt: po.updated_at ? new Date(po.updated_at) : new Date(),
      };
    } catch {
      return null;
    }
  }
  async saveOrder(order: ProductionOrder): Promise<void> {
    // productionOrder is not in Prisma schema — use raw query fallback
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO production_orders (id, customer_id, status, priority, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET customer_id=$2, status=$3, priority=$4, updated_at=NOW()`,
        order.id,
        order.customerId ?? null,
        order.status,
        order.priority,
      );
    } catch {
      // table may not exist yet; silently skip
    }
  }
  async saveAsset(asset: EngineDesignAsset): Promise<void> {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO design_assets (id, production_order_id, filename, storage_key, mime_type, size, checksum_sha256, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) ON CONFLICT (id) DO NOTHING`,
        asset.id,
        asset.productionOrderId ?? null,
        asset.originalFilename,
        asset.storageKey,
        asset.mimeType ?? null,
        asset.sizeBytes ?? null,
        asset.checksumSha256 ?? null,
      );
    } catch { /* table may not exist */ }
  }
  async saveTicket(ticket: EngineJobTicket): Promise<void> {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO job_tickets (id, production_order_id, ticket_number, department, status, payload, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT (id) DO NOTHING`,
        ticket.id,
        (ticket as any).productionOrderId ?? null,
        ticket.ticketNumber,
        ticket.department,
        ticket.status,
        (ticket as any).payload ? JSON.stringify((ticket as any).payload) : null,
      );
    } catch { /* table may not exist */ }
  }
  async saveQueueItem(item: EngineWorkQueueItem): Promise<void> {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO work_queue_items (id, job_ticket_id, department, status, position, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT (id) DO NOTHING`,
        item.id,
        item.jobTicketId,
        item.department,
        item.status,
        item.position ?? 0,
      );
    } catch { /* table may not exist */ }
  }
  async getQueueItems(filter: EngineQueueFilter): Promise<{ items: EngineWorkQueueItem[]; nextCursor: string | null }> {
    try {
      const limit = filter.limit ?? 50;
      const conditions: string[] = [];
      const params: any[] = [];
      if (filter.department) { params.push(filter.department); conditions.push(`department = $${params.length}`); }
      if (filter.status) { params.push(filter.status); conditions.push(`status = $${params.length}`); }
      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
      params.push(limit);
      const rows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id, job_ticket_id, department, status, position, started_at, finished_at, created_at FROM work_queue_items ${where} ORDER BY created_at ASC LIMIT $${params.length}`,
        ...params
      );
      const items: EngineWorkQueueItem[] = rows.map(r => ({
        id: r.id,
        jobTicketId: r.job_ticket_id,
        department: r.department,
        status: r.status,
        position: r.position,
        startedAt: r.started_at ? new Date(r.started_at) : null,
        finishedAt: r.finished_at ? new Date(r.finished_at) : null,
      }));
      const nextCursor = items.length < limit ? null : items[items.length - 1].id;
      return { items, nextCursor };
    } catch { return { items: [], nextCursor: null }; }
  }
  async countQueueItemsByDepartment(department: EngineDepartment): Promise<number> {
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(
        'SELECT COUNT(*) as c FROM work_queue_items WHERE department = $1', department
      );
      return Number(rows[0]?.c ?? 0);
    } catch { return 0; }
  }
  async nextTicketSequence(): Promise<number> {
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>('SELECT COUNT(*) as c FROM job_tickets');
      return Number(rows[0]?.c ?? 0) + 1;
    } catch { return 1; }
  }
}

export const createPrismaProductionRepository = () => new PrismaProductionRepository();
