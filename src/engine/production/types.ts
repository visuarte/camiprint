import 'server-only';

/**
 * Engine: Production Module — Domain Types
 *
 * Regla: este módulo NO importa next/*, react, cookies, headers ni objetos HTTP.
 * Es lógica de negocio pura, testeable sin framework.
 */

// ─── Enums de dominio ──────────────────────────────────────────────────────

export type ProductionOrderStatus =
  | 'PENDING_ASSETS'
  | 'READY_FOR_REVIEW'
  | 'IN_PRODUCTION'
  | 'BLOCKED'
  | 'DONE';

export type ProductionOrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type JobTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export type Department = 'PREPRESS' | 'PRINTING' | 'QA' | 'SHIPPING';

export type QueueStatus = 'WAITING' | 'ACTIVE' | 'BLOCKED' | 'DONE';

export type AllowedMimeType = 'application/pdf' | 'image/tiff';

export const ALLOWED_EXTENSIONS = ['.pdf', '.tif', '.tiff'] as const;
export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export const MAX_ASSET_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// ─── Entidades de dominio ──────────────────────────────────────────────────

export interface ProductionOrder {
  id: string;
  quoteId: string;
  customerId: string;
  status: ProductionOrderStatus;
  priority: ProductionOrderPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignAsset {
  id: string;
  productionOrderId: string;
  originalFilename: string;
  mimeType: string;
  extension: AllowedExtension;
  sizeBytes: number;
  storageKey: string;
  checksumSha256: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface JobTicket {
  id: string;
  productionOrderId: string;
  ticketNumber: string;
  garmentType: string;
  printTechnique: string;
  colorCount: number;
  quantity: number;
  dueDate: Date;
  notes: string;
  status: JobTicketStatus;
  assignedDepartment: Department;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkQueueItem {
  id: string;
  department: Department;
  jobTicketId: string;
  position: number;
  queueStatus: QueueStatus;
  startedAt: Date | null;
  finishedAt: Date | null;
}

// ─── DTOs de entrada al Engine ─────────────────────────────────────────────

export interface RegisterAssetInput {
  productionOrderId: string;
  originalFilename: string;
  mimeType: string;
  extension: AllowedExtension;
  sizeBytes: number;
  storageKey: string;
  checksumSha256: string;
  uploadedBy: string;
}

export interface CreateTicketInput {
  productionOrderId: string;
  garmentType: string;
  printTechnique: string;
  colorCount: number;
  quantity: number;
  dueDate: Date;
  notes?: string;
}

export interface QueueFilter {
  department?: Department;
  queueStatus?: QueueStatus;
  limit?: number;
  cursor?: string;
}

// ─── Puertos (interfaces que el Engine consume, implementadas en server/) ──

export interface IProductionRepository {
  findOrder(id: string): Promise<ProductionOrder | null>;
  saveOrder(order: ProductionOrder): Promise<void>;
  saveAsset(asset: DesignAsset): Promise<void>;
  saveTicket(ticket: JobTicket): Promise<void>;
  saveQueueItem(item: WorkQueueItem): Promise<void>;
  getQueueItems(filter: QueueFilter): Promise<{ items: WorkQueueItem[]; nextCursor: string | null }>;
  countQueueItemsByDepartment(department: Department): Promise<number>;
  // Returns the next sequence number for ticket numbering. Simple increment.
  nextTicketSequence(): Promise<number>;
}
