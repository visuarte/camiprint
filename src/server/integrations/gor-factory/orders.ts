// =============================================================================
// Gor Factory — Módulo de Pedidos
// =============================================================================

import { GorFactoryClient } from './client';
import { GorOrderPayload, GorApiResult } from './types';

export class GorOrdersModule {
  constructor(private readonly client: GorFactoryClient) {}

  /**
   * Crea un pedido en Gor Factory.
   * POST /api/v1.0/order
   */
  async createOrder(payload: GorOrderPayload): Promise<GorApiResult<{ orderNumber?: string }>> {
    return this.client.postJson<{ orderNumber?: string }>('/api/v1.0/order', payload);
  }
}
