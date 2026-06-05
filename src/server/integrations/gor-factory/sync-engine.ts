// =============================================================================
// Gor Factory — Sync Engine (Orquestador)
// =============================================================================

import { createGorFactory, GorFactoryModules } from './factory';
import { GorBrand } from './types';

export interface SyncCatalogResult {
  brand: GorBrand;
  itemsCount: number;
  categoriesCount: number;
  success: boolean;
  error?: string;
}

export interface SyncAllResult {
  timestamp: string;
  catalog: SyncCatalogResult[];
  stock: { success: boolean; error?: string };
  overall: 'ok' | 'partial' | 'failed';
}

export class GorSyncEngine {
  private modules: GorFactoryModules;

  constructor() {
    this.modules = createGorFactory();
  }

  /**
   * Sincroniza el catálogo de una marca.
   */
  async syncCatalog(brand: GorBrand): Promise<SyncCatalogResult> {
    try {
      const [catalogResult, categoriesResult] = await Promise.all([
        this.modules.catalog.getCatalog(brand),
        this.modules.catalog.getCategories(brand),
      ]);

      if (!catalogResult.success) {
        return {
          brand,
          itemsCount: 0,
          categoriesCount: 0,
          success: false,
          error: catalogResult.error,
        };
      }

      return {
        brand,
        itemsCount: catalogResult.data?.length ?? 0,
        categoriesCount: categoriesResult.data?.length ?? 0,
        success: true,
      };
    } catch (error) {
      return {
        brand,
        itemsCount: 0,
        categoriesCount: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Sincroniza stock de un almacén y marca.
   */
  async syncStock(whscode: string, brand: GorBrand) {
    try {
      const result = await this.modules.stock.getUserStock({ whscode, brand });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Sincronización completa: Roly + Stamina.
   */
  async syncAll(whscode = '01'): Promise<SyncAllResult> {
    const timestamp = new Date().toISOString();
    const brands: GorBrand[] = ['roly', 'stamina'];

    // Catálogo en paralelo
    const catalogResults = await Promise.all(
      brands.map((brand) => this.syncCatalog(brand)),
    );

    // Stock en paralelo
    const stockResults = await Promise.all(
      brands.map((brand) => this.syncStock(whscode, brand)),
    );

    const allCatalogOk = catalogResults.every((r) => r.success);
    const anyStockOk = stockResults.some((r) => r.success);

    const overall = allCatalogOk && anyStockOk ? 'ok' : catalogResults.some((r) => r.success) ? 'partial' : 'failed';

    return {
      timestamp,
      catalog: catalogResults,
      stock: { success: anyStockOk, error: undefined },
      overall,
    };
  }
}
