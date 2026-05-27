import type {
  IProductionRepository,
  ProductionOrder,
  DesignAsset,
  JobTicket,
  WorkQueueItem,
  QueueFilter,
  Department,
} from '@/engine/production/types';

export class InMemoryProductionRepository implements IProductionRepository {
  private orders = new Map<string, ProductionOrder>();
  private assets = new Map<string, DesignAsset>();
  private tickets = new Map<string, JobTicket>();
  private queue = new Map<string, WorkQueueItem>();
  private ticketSeq = 0;

  async findOrder(id: string) {
    return this.orders.get(id) ?? null;
  }
  async saveOrder(order: ProductionOrder) {
    this.orders.set(order.id, order);
  }
  async saveAsset(asset: DesignAsset) {
    this.assets.set(asset.id, asset);
  }
  async saveTicket(ticket: JobTicket) {
    this.tickets.set(ticket.id, ticket);
  }
  async saveQueueItem(item: WorkQueueItem) {
    this.queue.set(item.id, item);
  }
  async getQueueItems(filter: QueueFilter) {
    const all = Array.from(this.queue.values()).filter((it) => {
      if (filter.department && it.department !== filter.department) return false;
      if (filter.status && it.status !== filter.status) return false;
      return true;
    });
    const items = all.slice(0, filter.limit ?? 50);
    const nextCursor = items.length < all.length ? items[items.length - 1].id : null;
    return { items, nextCursor };
  }
  async countQueueItemsByDepartment(department: Department) {
    let c = 0;
    for (const it of this.queue.values()) if (it.department === department) c++;
    return c;
  }
  async nextTicketSequence() {
    this.ticketSeq += 1;
    return this.ticketSeq;
  }
}

export const createInMemoryProductionRepository = () => new InMemoryProductionRepository();
