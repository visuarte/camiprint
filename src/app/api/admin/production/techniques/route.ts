// =============================================================================
// API: Técnicas de estampación (CRUD)
// =============================================================================

import { NextResponse } from 'next/server';
import { listTechniques, getActiveTechniques, createTechnique } from '@/server/production/techniques';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get('active') === 'true';

  try {
    const techniques = activeOnly ? await getActiveTechniques() : await listTechniques();
    return NextResponse.json({ ok: true, data: techniques });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const technique = await createTechnique(body);
    return NextResponse.json({ ok: true, data: technique }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}
