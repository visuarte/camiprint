// =============================================================================
// Gor Factory — Módulo de Stock
// =============================================================================

import { GorFactoryClient } from './client';
import {
  GorBrand,
  GorStockFilter,
  GorStockRawItem,
  GorStockItem,
  GorConsignmentUpdate,
  GorApiResult,
} from './types';

const mapRawToStockItem = (raw: GorStockRawItem): GorStockItem => ({
  sku: raw.sku,
  description: raw.description,
  onhand: raw.onhand,
  incoming: raw.incoming?.trim() || null,
  state: raw.state?.trim() || '',
  pendingSupply: raw.canteco ?? 0,
  brand: (raw.brand as GorBrand) || 'roly',
});

export class GorStockModule {
  constructor(private readonly client: GorFactoryClient) {}

  /**
   * Obtiene el stock disponible del usuario para una marca y almacén.
   * POST /api/v1.0/stock/getuserstock
   */
  async getUserStock(filter: GorStockFilter): Promise<GorApiResult<GorStockItem[]>> {
    const result = await this.client.postForm<GorStockRawItem[]>(
      '/api/v1.0/stock/getuserstock',
      {
        whscode: filter.whscode,
        brand: filter.brand,
      },
    );

    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const items: GorStockItem[] = result.data.map(mapRawToStockItem);
    return { success: true, data: items };
  }

  /**
   * Actualiza el stock en consigna.
   * PUT /api/v1.0/stock/consignment
   */
  async updateConsignment(payload: GorConsignmentUpdate): Promise<GorApiResult<unknown>> {
    return this.client.putJson<unknown>('/api/v1.0/stock/consignment', payload);
  }
}
