// =============================================================================
// Gor Factory — Módulo de Catálogo (Items, Categorías, Precios)
// =============================================================================

import { GorFactoryClient } from './client';
import {
  GorBrand,
  GorCatalogRawItem,
  GorCatalogItem,
  GorCategory,
  GorPriceListFilter,
  GorPriceListItem,
  GorApiResult,
} from './types';

const mapRawToCatalogItem = (raw: GorCatalogRawItem): GorCatalogItem => ({
  itemcode: raw.itemcode,
  itemname: raw.itemname,
  eancode: raw.eancode,
  modelcode: raw.modelcode,
  modelname: raw.modelname,
  description: raw.description,
  composition: raw.composition,
  brand: raw.brand as GorBrand,
  family: raw.family,
  gender: raw.gender,
  sizename: raw.sizename,
  colorname: raw.colorname,
  productimage: raw.productimage,
  modelimage: raw.modelimage,
  detailsimages: raw.detailsimages ? raw.detailsimages.split(',').filter(Boolean) : [],
  viewsimages: raw.viewsimages ? raw.viewsimages.split(',').filter(Boolean) : [],
  moq: parseInt(raw.moq, 10) || 1,
  boxunits: parseInt(raw.boxunits, 10) || 0,
  weight: raw.weight,
  madein: raw.madein,
  categories: raw.categories ? raw.categories.split(',').filter(Boolean) : [],
});

export class GorCatalogModule {
  constructor(private readonly client: GorFactoryClient) {}

  /**
   * Obtiene el catálogo completo de una marca.
   * GET /api/v1.0/item/getcatalog?lang=es-ES&brand=X
   */
  async getCatalog(brand: GorBrand, lang = 'es-ES'): Promise<GorApiResult<GorCatalogItem[]>> {
    const result = await this.client.get<GorCatalogRawItem[]>(
      `/api/v1.0/item/getcatalog?lang=${lang}&brand=${brand}`,
    );

    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const items: GorCatalogItem[] = result.data.map(mapRawToCatalogItem);

    return { success: true, data: items };
  }

  /**
   * Obtiene detalle de un artículo por código.
   * GET /api/v1.0/item/get?itemcode=X&lang=es-ES
   */
  async getItem(itemcode: string, lang = 'es-ES'): Promise<GorApiResult<GorCatalogItem>> {
    const result = await this.client.get<GorCatalogRawItem>(
      `/api/v1.0/item/get?itemcode=${itemcode}&lang=${lang}`,
    );

    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    return { success: true, data: mapRawToCatalogItem(result.data) };
  }

  /**
   * Obtiene lista de precios con filtros opcionales.
   * POST /api/v1.0/item/pricelist
   */
  async getPriceList(filter: GorPriceListFilter = {}): Promise<GorApiResult<GorPriceListItem[]>> {
    const headers: Record<string, string> = {};
    if (filter.brand) headers['brand'] = filter.brand;
    if (filter.category) headers['category'] = filter.category;
    if (filter.model) headers['model'] = filter.model;
    if (filter.color) headers['color'] = filter.color;
    if (filter.size) headers['size'] = filter.size;
    if (filter.includeoutlet !== undefined) headers['includeoutlet'] = String(filter.includeoutlet);

    return this.client.postForm<GorPriceListItem[]>(
      `/api/v1.0/item/pricelist`,
      headers,
    );
  }

  /**
   * Obtiene categorías planas.
   * GET /api/v1.0/item/categories?lang=es-ES&brand=X
   */
  async getCategories(brand: GorBrand, lang = 'es-ES'): Promise<GorApiResult<GorCategory[]>> {
    return this.client.get<GorCategory[]>(
      `/api/v1.0/item/categories?lang=${lang}&brand=${brand}`,
    );
  }

  /**
   * Obtiene árbol de categorías.
   * GET /api/v1.0/item/categories/tree?lang=es-ES&brand=X
   */
  async getCategoryTree(
    brand: GorBrand,
    category?: string,
    lang = 'es-ES',
  ): Promise<GorApiResult<GorCategory[]>> {
    let path = `/api/v1.0/item/categories/tree?lang=${lang}&brand=${brand}`;
    if (category) path += `&category=${category}`;
    return this.client.get<GorCategory[]>(path);
  }
}
