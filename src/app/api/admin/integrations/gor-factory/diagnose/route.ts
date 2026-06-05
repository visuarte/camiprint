// =============================================================================
// Diagnóstico de integración Gor Factory (solo local/dev)
// Permite probar el Engine sin tocar la base de datos real.
// =============================================================================

import { NextResponse } from 'next/server';
import { GorFactoryClient } from '@/server/integrations/gor-factory/client';
import { GorCatalogModule } from '@/server/integrations/gor-factory/catalog';
import { GorStockModule } from '@/server/integrations/gor-factory/stock';
import { GorOrdersModule } from '@/server/integrations/gor-factory/orders';
import { GorDocumentsModule } from '@/server/integrations/gor-factory/documents';

// Solo disponible en desarrollo
export async function GET(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Solo disponible en desarrollo' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'version';
  const brand = searchParams.get('brand') || 'roly';
  const whscode = searchParams.get('whscode') || '01';

  const username = searchParams.get('username') || process.env.GOR_USERNAME || 'it09@gorfactory.es';
  const password = searchParams.get('password') || process.env.GOR_PASSWORD || 'Test1234';

  const client = new GorFactoryClient('dev', username, password);
  const catalog = new GorCatalogModule(client);
  const stock = new GorStockModule(client);
  const orders = new GorOrdersModule(client);
  const documents = new GorDocumentsModule(client);

  const results: Record<string, unknown> = {};

  try {
    switch (action) {
      // ---- AUTH ----
      case 'login': {
        const token = await client.getToken();
        results.token = `${token?.slice(0, 20)}...`;
        results.tokenLength = token?.length;
        results.loginOk = true;
        break;
      }

      // ---- VERSIÓN ----
      case 'version': {
        const v1 = await client.get<{ version?: string }>('/api/v1.0/version', { skipAuth: false });
        const v2 = await client.get<{ version?: string }>('/api/v2.0/version', { skipAuth: false });
        results.v1 = v1;
        results.v2 = v2;
        break;
      }

      // ---- CATÁLOGO ----
      case 'catalog': {
        results.catalog = await catalog.getCatalog(brand as never);
        if (results.catalog && typeof results.catalog === 'object' && 'data' in (results.catalog as object)) {
          const data = (results.catalog as { data: unknown[] }).data;
          results.itemsCount = data?.length ?? 0;
          results.sample = data?.slice(0, 2);
        }
        break;
      }

      // ---- CATEGORÍAS ----
      case 'categories': {
        results.categories = await catalog.getCategories(brand as never);
        results.categoriesTree = await catalog.getCategoryTree(brand as never);
        break;
      }

      // ---- STOCK ----
      case 'stock': {
        results.stock = await stock.getUserStock({ whscode, brand: brand as never });
        break;
      }

      // ---- FULL DIAGNOSE ----
      case 'full': {
        // Test 1: Auth
        const token = await client.getToken();
        results.auth = { ok: true, tokenPreview: `${token?.slice(0, 20)}...` };

        // Test 2: Version
        results.version = await client.get('/api/v1.0/version', { skipAuth: false });

        // Test 3: Catalog (solo conteo)
        const catResult = await catalog.getCatalog(brand as never);
        results.catalog = {
          success: catResult.success,
          itemsCount: catResult.data?.length ?? 0,
          error: catResult.error,
        };

        // Test 4: Categories
        const catTree = await catalog.getCategoryTree(brand as never);
        results.categories = { success: catTree.success, count: catTree.data?.length ?? 0 };

        // Test 5: Stock
        const stResult = await stock.getUserStock({ whscode, brand: brand as never });
        results.stock = {
          success: stResult.success,
          itemsCount: stResult.data?.length ?? 0,
          sample: stResult.data?.slice(0, 3),
          error: stResult.error,
        };

        break;
      }

      default:
        results.error = `Acción desconocida: ${action}`;
    }
  } catch (error) {
    results.error = error instanceof Error ? error.message : String(error);
    results.stack = error instanceof Error ? error.stack : undefined;
  }

  return NextResponse.json(results, { status: results.error ? 500 : 200 });
}
