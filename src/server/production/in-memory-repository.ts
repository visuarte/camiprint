// NOTE: Define local, minimal types here to avoid importing from `engine/`.
// This preserves the architectural layering: API (bridge) is the only layer
// that may import engine/core. Server persistence implements the same
// shape locally.
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
  productionOrderId?: string;
  filename: string;
  storageKey: string;
  mimeType?: string;
  size?: number;
  checksumSha256?: string;
  createdAt?: string | Date;
};

type JobTicket = {
  id: string;
  productionOrderId?: string;
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
