import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { verifyAdminToken } from '@/app/api/admin/auth-utils';
import { getProductPricing } from '@/server/products/pricing-engine';

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(200, parseInt(searchParams.get('limit') ?? '50', 10));
  const source = searchParams.get('source');

  try {
    const where: any = {};
    if (source) where.source = source;

    const [items, total] = await Promise.all([
      prisma.productPricing.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productPricing.count({ where }),
    ]);

    const enriched = items.map((item) => {
      const base = item.costPrice + item.printingCost;
      let publicPrice: number;
      if (item.publicPrice != null) {
        publicPrice = item.publicPrice;
      } else if (item.fixedMargin != null) {
        publicPrice = base + item.fixedMargin;
      } else {
        publicPrice = base * (1 + item.marginMarkup);
      }
      publicPrice = Math.round(publicPrice * 100) / 100;

      return {
        ...item,
        baseCost: Math.round(base * 100) / 100,
        calculatedPrice: publicPrice,
        profit: Math.round((publicPrice - base) * 100) / 100,
        profitMargin: base > 0 ? Math.round(((publicPrice - base) / publicPrice) * 100) : 0,
      };
    });

    return NextResponse.json({ ok: true, items: enriched, total, page, limit });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sku, costPrice, printingCost, marginMarkup, fixedMargin, publicPrice, productName } = body;

    if (!sku) {
      return NextResponse.json({ error: 'Missing sku' }, { status: 422 });
    }

    // Validar márgenes para evitar errores tipográficos catastróficos
    if (marginMarkup !== undefined && (marginMarkup < 0 || marginMarkup > 2.0)) {
      return NextResponse.json({ error: 'marginMarkup debe estar entre 0 y 2.0 (0%–200%)' }, { status: 422 });
    }
    if (fixedMargin !== undefined && fixedMargin < 0) {
      return NextResponse.json({ error: 'fixedMargin no puede ser negativo' }, { status: 422 });
    }
    if (publicPrice !== undefined && publicPrice < 0) {
      return NextResponse.json({ error: 'publicPrice no puede ser negativo' }, { status: 422 });
    }
    if (costPrice !== undefined && costPrice < 0) {
      return NextResponse.json({ error: 'costPrice no puede ser negativo' }, { status: 422 });
    }
    if (printingCost !== undefined && printingCost < 0) {
      return NextResponse.json({ error: 'printingCost no puede ser negativo' }, { status: 422 });
    }

    const data: any = {};
    if (costPrice !== undefined) data.costPrice = costPrice;
    if (printingCost !== undefined) data.printingCost = printingCost;
    if (marginMarkup !== undefined) data.marginMarkup = marginMarkup;
    if (fixedMargin !== undefined) data.fixedMargin = fixedMargin;
    if (publicPrice !== undefined) data.publicPrice = publicPrice;
    if (productName !== undefined) data.productName = productName;

    const pricing = await prisma.productPricing.upsert({
      where: { sku },
      update: data,
      create: {
        sku,
        costPrice: costPrice ?? 0,
        printingCost: printingCost ?? 0,
        marginMarkup: marginMarkup ?? 0.6,
        fixedMargin: fixedMargin ?? null,
        publicPrice: publicPrice ?? null,
        productName: productName ?? null,
      },
    });

    return NextResponse.json({ ok: true, pricing });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
