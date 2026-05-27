import 'server-only';

/**
 * Engine: Production Module — Facade (casos de uso)
 *
 * Orquesta toda la lógica de negocio de producción.
 * NO importa next/*, react, cookies, headers ni objetos HTTP.
 * Recibe puertos (interfaces) inyectados desde server/.
 */

import { randomUUID } from 'crypto';

import {
  type IProductionRepository,
  type RegisterAssetInput,
  type CreateTicketInput,
  type QueueFilter,
  type DesignAsset,
  type JobTicket,
  type WorkQueueItem,
  type ProductionOrderStatus,
} from './types';
import { validateRegisterAssetInput, validateCreateTicketInput } from './validators';
import { createJobTicket, buildTicketNumber } from './ticket-factory';
import { routeTicketToDepartment } from './routing-policy';

export interface EngineResult<T> {
  ok: boolean;
  data?: T;
  errors?: string[];
}

export class ProductionEngine {
  constructor(private readonly repo: IProductionRepository) {}

  /**
   * Registra un DesignAsset ya subido a storage y actualiza el estado de la orden.
   */
  async registerDesignAsset(
    input: RegisterAssetInput,
  ): Promise<EngineResult<{ assetId: string; storageKey: string }>> {
    const validation = validateRegisterAssetInput(input);
    if (!validation.ok) {
      return { ok: false, errors: validation.errors };
    }

    const order = await this.repo.findOrder(input.productionOrderId);
    if (!order) {
      return { ok: false, errors: [`Orden ${input.productionOrderId} no encontrada`] };
    }

    const asset: DesignAsset = {
      id: randomUUID(),
      productionOrderId: input.productionOrderId,
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      extension: input.extension,
      sizeBytes: input.sizeBytes,
      storageKey: input.storageKey,
      checksumSha256: input.checksumSha256,
      uploadedBy: input.uploadedBy,
      uploadedAt: new Date(),
    };

    await this.repo.saveAsset(asset);

    // Transición de estado: si la orden estaba pendiente de assets, avanza
    const nextStatus: ProductionOrderStatus =
      order.status === 'PENDING_ASSETS' ? 'READY_FOR_REVIEW' : order.status;

    await this.repo.saveOrder({
      ...order,
      status: nextStatus,
      updatedAt: new Date(),
    });

    return { ok: true, data: { assetId: asset.id, storageKey: asset.storageKey } };
  }

  /**
   * Crea un JobTicket con enrutamiento automático a departamento.
   */
  async createJobTicket(
    input: CreateTicketInput,
    sequenceProvider: () => Promise<number>,
  ): Promise<EngineResult<{ ticketId: string; ticketNumber: string; assignedDepartment: string }>> {
    const validation = validateCreateTicketInput(input);
    if (!validation.ok) {
      return { ok: false, errors: validation.errors };
    }

    const order = await this.repo.findOrder(input.productionOrderId);
    if (!order) {
      return { ok: false, errors: [`Orden ${input.productionOrderId} no encontrada`] };
    }

    const department = routeTicketToDepartment(input);
    const sequence = await sequenceProvider();
    const ticketNumber = buildTicketNumber(sequence);
    const ticket = createJobTicket(randomUUID(), ticketNumber, input, department);

    await this.repo.saveTicket(ticket);

    // Añadir a la cola del departamento asignado
    const position = (await this.repo.countQueueItemsByDepartment(department)) + 1;
    const queueItem: WorkQueueItem = {
      id: randomUUID(),
      department,
      jobTicketId: ticket.id,
      position,
      queueStatus: 'WAITING',
      startedAt: null,
      finishedAt: null,
    };
    await this.repo.saveQueueItem(queueItem);

    // Transición de estado de la orden
    await this.repo.saveOrder({
      ...order,
      status: 'IN_PRODUCTION',
      updatedAt: new Date(),
    });

    return {
      ok: true,
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        assignedDepartment: ticket.assignedDepartment,
      },
    };
  }

  /**
   * Consulta la cola de trabajo con filtros opcionales.
   */
  async getDepartmentQueue(filter: QueueFilter): Promise<
    EngineResult<{
      items: Array<{
        queueItemId: string;
        jobTicketId: string;
        department: string;
        queueStatus: string;
        position: number;
      }>;
      nextCursor: string | null;
    }>
  > {
    const { items, nextCursor } = await this.repo.getQueueItems(filter);

    return {
      ok: true,
      data: {
        items: items.map((i) => ({
          queueItemId: i.id,
          jobTicketId: i.jobTicketId,
          department: i.department,
          queueStatus: i.queueStatus,
          position: i.position,
        })),
        nextCursor,
      },
    };
  }
}
