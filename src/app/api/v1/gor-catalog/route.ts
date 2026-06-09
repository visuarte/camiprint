import { GorFactoryClient } from '@/server/integrations/gor-factory/client';
import { getRedisClient } from '@/server/platform/redis/client';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const PRICE_CACHE_KEY = 'gor:pricecache';
const PRICE_TTL_SEC = 3600; // 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand') || 'roly';
    const env = (searchParams.get('env') || 'pro') as 'dev' | 'pro';
    const includePrices = searchParams.get('prices') === 'true';
    const username = process.env.GOR_USERNAME || '';
    const password = process.env.GOR_PASSWORD || '';

    const client = new GorFactoryClient(env, username, password);
    const token = await client.getToken().catch(() => null);
    if (!token) {
      return Response.json({ error: 'Login failed' }, { status: 401 });
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

    const responseBody: Record<string, unknown> = {
      brand,
      families: [...new Set(models.map((m) => m.family).filter(Boolean))].sort(),
      models,
      total: models.length,
    };

    if (includePrices) {
      const redis = getRedisClient(REDIS_URL);
      let priceItems: { itemcode: string; price: number }[] = [];

      const cached = await redis.get(PRICE_CACHE_KEY);
      if (cached) {
        priceItems = JSON.parse(cached);
      } else {
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
            await redis.setex(PRICE_CACHE_KEY, PRICE_TTL_SEC, JSON.stringify(priceItems));
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

    return Response.json(responseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message, stack: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}
