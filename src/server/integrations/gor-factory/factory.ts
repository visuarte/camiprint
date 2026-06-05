// =============================================================================
// Gor Factory — Factory
// =============================================================================

import { GorFactoryClient } from './client';
import { GorCatalogModule } from './catalog';
import { GorStockModule } from './stock';
import { GorOrdersModule } from './orders';
import { GorDocumentsModule } from './documents';
import { GorBrand } from './types';

export interface GorFactoryModules {
  client: GorFactoryClient;
  catalog: GorCatalogModule;
  stock: GorStockModule;
  orders: GorOrdersModule;
  documents: GorDocumentsModule;
}

/**
 * Crea una instancia completa de los módulos de Gor Factory.
 *
 * Las credenciales se leen de variables de entorno:
 * - GOR_USERNAME
 * - GOR_PASSWORD
 * - GOR_ENVIRONMENT (dev | pro, default: dev)
 */
export function createGorFactory(): GorFactoryModules {
  const environment = (process.env.GOR_ENVIRONMENT?.trim() as 'dev' | 'pro') || 'dev';
  const username = process.env.GOR_USERNAME?.trim();
  const password = process.env.GOR_PASSWORD?.trim();

  if (!username || !password) {
    throw new Error(
      'Faltan credenciales GOR (GOR_USERNAME, GOR_PASSWORD)',
    );
  }

  const client = new GorFactoryClient(environment, username, password);

  return {
    client,
    catalog: new GorCatalogModule(client),
    stock: new GorStockModule(client),
    orders: new GorOrdersModule(client),
    documents: new GorDocumentsModule(client),
  };
}
