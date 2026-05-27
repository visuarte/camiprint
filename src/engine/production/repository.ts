import 'server-only';

/**
 * Engine: Production Module — InMemory Repository
 *
 * Implementa IProductionRepository del Engine.
 * Se sustituirá por una implementación PostgreSQL/Prisma cuando el schema
 * de producción esté migrado.
 */

import {
  type IProductionRepository,
  type ProductionOrder,
  type DesignAsset,
  type JobTicket,
  type WorkQueueItem,
  type QueueFilter,
  type Department,
} from './types';

// Singleton en proceso (adecuado para desarrollo; reemplazar por DB en producción)
const store = {
  orders: new Map<string, ProductionOrder>(),
  assets: new Map<string, DesignAsset>(),
  tickets: new Map<string, JobTicket>(),
  queue: new Map<string, WorkQueueItem>(),
  ticketSequence: 0,
};

export class InMemoryProductionRepository implements IProductionRepository {
  async findOrder(id: string): Promise<ProductionOrder | null> {
    return store.orders.get(id) ?? null;
  }

  async saveOrder(order: ProductionOrder): Promise<void> {
    store.orders.set(order.id, order);
  }

  async saveAsset(asset: DesignAsset): Promise<void> {
    store.assets.set(asset.id, asset);
  }

  async saveTicket(ticket: JobTicket): Promise<void> {
    store.tickets.set(ticket.id, ticket);
  }

  async saveQueueItem(item: WorkQueueItem): Promise<void> {
    store.queue.set(item.id, item);
  }

  async getQueueItems(
    filter: QueueFilter,
  ): Promise<{ items: WorkQueueItem[]; nextCursor: string | null }> {
    let items = Array.from(store.queue.values());

    if (filter.department) {
      items = items.filter((i) => i.department === filter.department);
    }
    if (filter.status) {
      items = items.filter((i) => i.status === filter.status);
    }

    // Cursor-based pagination: cursor = último id visto
    if (filter.cursor) {
      const cursorIdx = items.findIndex((i) => i.id === filter.cursor);
      if (cursorIdx >= 0) {
        items = items.slice(cursorIdx + 1);
      }
    }

    const limit = filter.limit ?? 20;
    const page = items.slice(0, limit);
    const nextCursor = items.length > limit ? page[page.length - 1].id : null;

    return { items: page, nextCursor };
  }

  async countQueueItemsByDepartment(department: Department): Promise<number> {
    return Array.from(store.queue.values()).filter((i) => i.department === department).length;
  }

  /** Helper para tests y seed — no forma parte del puerto */
  async nextTicketSequence(): Promise<number> {
    store.ticketSequence += 1;
    return store.ticketSequence;
  }

  /** Seed: crea una ProductionOrder de prueba si no existe */
  async seedOrder(order: ProductionOrder): Promise<void> {
    if (!store.orders.has(order.id)) {
      store.orders.set(order.id, order);
    }
  }
}

// Instancia singleton exportada para uso desde route handlers (bridge)
let _repo: InMemoryProductionRepository | null = null;
export function getProductionRepository(): InMemoryProductionRepository {
  if (!_repo) _repo = new InMemoryProductionRepository();
  return _repo;
}
