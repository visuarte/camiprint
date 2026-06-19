import { GorFactoryClient } from '@/server/integrations/gor-factory/client';
import { getRedisClient } from '@/server/platform/redis/client';
import { sanitizeCatalogItem, sanitizeBrandField, getProductPricing } from '@/server/products/pricing-engine';

const REDIS_URL = process.env.REDIS_URL || '';
const PRICE_CACHE_KEY = 'gor:pricecache';
const PRICE_TTL_SEC = 3600;

const CLIENTS = new Map<string, GorFactoryClient>();

function getClient(env: 'dev' | 'pro', username: string, password: string): GorFactoryClient {
  const key = `${env}:${username}`;
  if (!CLIENTS.has(key)) {
    CLIENTS.set(key, new GorFactoryClient(env, username, password));
  }
  return CLIENTS.get(key)!;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand') || 'roly';
    const env = (searchParams.get('env') || 'pro') as 'dev' | 'pro';
    const includePrices = searchParams.get('prices') === 'true';
    const username = process.env.GOR_USERNAME || '';
    const password = process.env.GOR_PASSWORD || '';

    const client = getClient(env, username, password);
    try {
      await client.getToken();
    } catch (err) {
      const detail = err instanceof Error ? `${err.message}` : 'Unknown error';
      return Response.json({ error: 'Login failed', detail }, { status: 401 });
    }

    const result = await client.get<Record<string, unknown>>(
      `/api/v1.0/item/getcatalog?lang=es-ES&brand=${brand}`,
    );

    if (!result.success || !result.data) {
      return Response.json({ error: result.error || 'Catalog fetch failed' }, { status: 502 });
    }

    let items: unknown[] = [];
    if (Array.isArray(result.data)) {
      items = result.data;
    } else if (result.data.item && Array.isArray(result.data.item)) {
      items = result.data.item;
    } else {
      return Response.json({
        error: 'Unexpected response structure',
        keys: Object.keys(result.data as object),
        sample: String(JSON.stringify(result.data)).slice(0, 500),
      }, { status: 502 });
    }

    const grouped: Record<string, {
      modelcode: string;
      modelname: string;
      description: string;
      brand: string;
      family: string;
      composition: string;
      imageUrl: string;
      category: string[];
      sizes: { code: string; name: string; measures?: string }[];
      colors: { code: string; name: string; image: string }[];
    }> = {};

    for (const item of items) {
      const raw = item as Record<string, string>;
      const mc = raw.modelcode || '';
      if (!mc) continue;

      if (!grouped[mc]) {
        grouped[mc] = {
          modelcode: mc,
          modelname: raw.modelname || mc,
          description: raw.description || '',
          brand: raw.brand || brand,
          family: raw.family || 'OTROS',
          composition: raw.composition || '',
          imageUrl: raw.modelimage || '',
          category: (raw.categories || '').split(',').filter(Boolean),
          sizes: [],
          colors: [],
        };
      }

      const g = grouped[mc];
      const sz = raw.sizename || raw.sizecode || '';
      if (sz && !g.sizes.some((s) => s.code === sz)) {
        const measuresRaw = raw.measures || '';
        const measures = measuresRaw.replace(/[[\]]/g, '').trim();
        g.sizes.push({ code: sz, name: sz, measures });
      }
      const cl = raw.colorname || raw.colorcode || '';
      if (cl && !g.colors.some((c) => c.name === cl)) {
        g.colors.push({ code: raw.colorcode || cl, name: cl, image: raw.productimage || '' });
      }
    }

    const models = Object.values(grouped);

    // Count sales by productId to sort by popularity
    try {
      const sales = await import('@/server/db').then(({ prisma }) =>
        prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
        })
      )
      const salesCount = new Map(sales.map((s: any) => [s.productId, s._sum.quantity || 0]))
      ;(models as Array<Record<string, unknown>>).sort((a: any, b: any) => {
        const aSales = salesCount.get(a.modelcode) || 0
        const bSales = salesCount.get(b.modelcode) || 0
        if (aSales !== bSales) return bSales - aSales
        return (a.modelcode || '').localeCompare(b.modelcode || '')
      })
    } catch {}

    const responseBody: Record<string, unknown> = {
      brand,
      families: [...new Set(models.map((m) => m.family).filter(Boolean))].sort(),
      models,
      total: models.length,
    };

    if (includePrices && REDIS_URL) {
      const redis = getRedisClient(REDIS_URL);
      let priceItems: { itemcode: string; price: number }[] = [];

      try {
        const cached = await redis.get(PRICE_CACHE_KEY);
        if (cached) {
          priceItems = JSON.parse(cached);
        }
      } catch {
        // cache errors are non-fatal
      }

      if (!priceItems.length) {
        try {
          const priceResult = await client.postForm<unknown>(
            '/api/v1.0/item/pricelist',
            {},
          );
          if (priceResult.success && priceResult.data) {
            if (Array.isArray(priceResult.data)) {
              priceItems = priceResult.data as { itemcode: string; price: number }[];
            } else {
              const pd = priceResult.data as Record<string, unknown>;
              if (Array.isArray(pd.item)) priceItems = pd.item as { itemcode: string; price: number }[];
              else if (Array.isArray(pd.items)) priceItems = pd.items as { itemcode: string; price: number }[];
            }
            if (redis) {
              try { await redis.setex(PRICE_CACHE_KEY, PRICE_TTL_SEC, JSON.stringify(priceItems)); } catch {}
            }
          }
        } catch {
          // pricelist errors are non-fatal; serve empty prices
        }
      }

      if (priceItems.length > 0) {
        const priceMap = new Map<string, number[]>();
        for (const p of priceItems) {
          const mc = p.itemcode.slice(0, 6);
          if (!priceMap.has(mc)) priceMap.set(mc, []);
          priceMap.get(mc)!.push(p.price);
        }
        for (const m of models as Array<Record<string, unknown>>) {
          const prices = priceMap.get(m.modelcode as string);
          if (prices && prices.length > 0) {
            m.priceMin = Math.min(...prices);
            m.priceMax = Math.max(...prices);
          }
        }
      }
    }

    // Sanitize brand names and enrich with Camiart pricing
    for (const m of models as Array<Record<string, unknown>>) {
      sanitizeCatalogItem(m)
      // Enrich with custom pricing from DB
      const sku = (m.modelcode as string) || ''
      if (sku) {
        const pricing = await getProductPricing(sku).catch(() => null)
        if (pricing && pricing.publicPrice > 0) {
          m.priceMin = pricing.publicPrice
          m.priceMax = pricing.publicPrice
        }
        // Override product name with Camiart name
        const dbPricing = await import('@/server/db').then(({ prisma }) =>
          prisma.productPricing.findUnique({ where: { sku } })
        )
        if (dbPricing?.productName) {
          m.modelname = dbPricing.productName
        }
      }
    }

    return Response.json(responseBody, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message, stack: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}
