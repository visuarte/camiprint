import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, productId, productName } = body

    if (!productId) {
      return NextResponse.json({ ok: false, error: 'Falta productId' }, { status: 422 })
    }
    if (!email && !phone) {
      return NextResponse.json({ ok: false, error: 'Email o teléfono requerido' }, { status: 422 })
    }

    console.log('[BackInStock] Registro:', { email, phone, productId, productName, timestamp: new Date().toISOString() })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 })
  }
}
