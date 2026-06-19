'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type Position = 'chest' | 'back' | 'sleeve-left' | 'sleeve-right'

const POSITION_LABELS: Record<Position, string> = {
  chest: 'Pecho', back: 'Espalda',
  'sleeve-left': 'Manga izquierda', 'sleeve-right': 'Manga derecha',
}

const SHIRT_COLORS = [
  { name: 'Blanco', hex: '#f5f5f0' }, { name: 'Negro', hex: '#222222' },
  { name: 'Gris', hex: '#999999' }, { name: 'Azul Marino', hex: '#1a2a3a' },
  { name: 'Rojo', hex: '#cc3333' }, { name: 'Verde', hex: '#2d7d46' },
]

const SHIRT_POLYGON: [number, number][] = [
  [0.35, 0.02], [0.65, 0.02], [0.92, 0.10], [0.85, 0.30],
  [0.88, 0.70], [0.90, 0.95], [0.10, 0.95], [0.12, 0.70],
  [0.15, 0.30], [0.08, 0.10],
]
const CUFF: [number, number][] = [[0.42, 0.04], [0.50, 0.12], [0.58, 0.04]]

function drawShirt(ctx: CanvasRenderingContext2D, W: number, H: number, color: string, img: string | null, text: string, fs: number) {
  ctx.clearRect(0, 0, W, H)
  const px = (x: number, y: number) => [x * W, y * H] as const

  // Silueta
  ctx.beginPath()
  const [sx, sy] = px(SHIRT_POLYGON[0][0], SHIRT_POLYGON[0][1]); ctx.moveTo(sx, sy)
  for (let i = 1; i < SHIRT_POLYGON.length; i++) { const [x, y] = px(SHIRT_POLYGON[i][0], SHIRT_POLYGON[i][1]); ctx.lineTo(x, y) }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill()
  ctx.strokeStyle = 'rgba(150,150,150,0.3)'; ctx.lineWidth = 1; ctx.stroke()

  // Cuello
  ctx.beginPath(); const [cx, cy] = px(CUFF[0][0], CUFF[0][1]); ctx.moveTo(cx, cy)
  for (let i = 1; i < CUFF.length; i++) { const [x, y] = px(CUFF[i][0], CUFF[i][1]); ctx.lineTo(x, y) }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.stroke()

  // Zona de estampado
  const zx = W * 0.25, zy = H * 0.25, zw = W * 0.50, zh = H * 0.35

  if (img) {
    const i = new Image()
    try {
      i.src = img
      if (i.complete && i.width > 0) {
        const asp = i.width / i.height; let dw = zw * 0.85, dh = zh * 0.85
        if (asp > 1) dh = dw / asp; else dw = dh * asp
        ctx.save(); ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip()
        ctx.drawImage(i, zx + (zw - dw) / 2, zy + (zh - dh) / 2, dw, dh); ctx.restore()
      }
    } catch {}
  }
  if (text) {
    ctx.save(); ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip()
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'
    ctx.font = `bold ${fs}px Arial`
    const words = text.split(' '), lines: string[] = []; let cl = ''
    for (const w of words) { const t = cl + w + ' '; if (ctx.measureText(t).width > zw * 0.85) { lines.push(cl.trim()); cl = w + ' ' } else cl = t }
    lines.push(cl.trim()); const lh = fs * 1.3, sy2 = zy + zh / 2 - ((lines.length - 1) * lh) / 2
    lines.forEach((l, i) => ctx.fillText(l, zx + zw / 2, sy2 + i * lh))
    ctx.restore()
  }
}

export default function MockupGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [designImage, setDesignImage] = useState<string | null>(null)
  const [designText, setDesignText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [shirtColor, setShirtColor] = useState('#f5f5f0')
  const [position, setPosition] = useState<Position>('chest')
  const [viewAngle, setViewAngle] = useState(0) // -30, 0, 30 grados
  const dragRef = useRef({ dragging: false, startX: 0, startAngle: 0 })

  const redraw = useCallback(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    const W = 500, H = 500
    canvasRef.current.width = W; canvasRef.current.height = H
    drawShirt(ctx, W, H, shirtColor, designImage, designText, fontSize)
  }, [shirtColor, designImage, designText, fontSize])

  useEffect(() => { redraw() }, [redraw])

  // Cargar imagen asíncrona
  useEffect(() => {
    if (!designImage) return
    const img = new Image()
    img.onload = () => redraw()
    img.onerror = () => redraw()
    img.src = designImage
  }, [designImage, redraw])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = () => setDesignImage(r.result as string); r.readAsDataURL(file) }
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a'); link.download = 'camiseta-diseno.png'
    link.href = canvasRef.current.toDataURL('image/png'); link.click()
  }

  // Arrastrar para rotar
  const handleMouseDown = (e: React.MouseEvent) => { dragRef.current = { dragging: true, startX: e.clientX, startAngle: viewAngle } }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return
    const delta = e.clientX - dragRef.current.startX
    const newAngle = Math.max(-45, Math.min(45, dragRef.current.startAngle + delta * 0.5))
    setViewAngle(Math.round(newAngle))
  }
  const handleMouseUp = () => { dragRef.current.dragging = false }

  useEffect(() => {
    const handler = () => { dragRef.current.dragging = false }
    window.addEventListener('mouseup', handler)
    return () => window.removeEventListener('mouseup', handler)
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Preview con efecto 3D CSS */}
      <div className="flex items-center justify-center rounded-2xl bg-gradient-to-b from-gray-50 to-white p-4 shadow-sm">
        <div className="select-none"
          style={{
            perspective: '800px',
            width: 400, height: 400,
          }}
        >
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={(e) => { const t = e.touches[0]; dragRef.current = { dragging: true, startX: t.clientX, startAngle: viewAngle } }}
            onTouchMove={(e) => { if (!dragRef.current.dragging) return; const delta = e.touches[0].clientX - dragRef.current.startX; setViewAngle(Math.max(-45, Math.min(45, dragRef.current.startAngle + delta * 0.5))) }}
            onTouchEnd={() => { dragRef.current.dragging = false }}
            style={{
              width: 400, height: 400,
              transform: `rotateY(${viewAngle}deg) scale(${1 - Math.abs(viewAngle) * 0.002})`,
              transformStyle: 'preserve-3d',
              transition: dragRef.current.dragging ? 'none' : 'transform 0.3s ease',
              cursor: 'grab',
            }}
          >
            <canvas ref={canvasRef} width={500} height={500}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {/* Sombra parallax */}
            <div style={{
              position: 'absolute', bottom: '-20px', left: '5%', right: '5%', height: 20,
              background: `radial-gradient(ellipse, rgba(0,0,0,${0.08 + Math.abs(viewAngle) * 0.003}) 0%, transparent 70%)`,
              filter: 'blur(6px)',
              transform: `translateX(${viewAngle * 0.5}px)`,
            }} />
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Diseña tu camiseta</h3>
          <p className="text-sm text-gray-500">Arrastra el diseño para rotarlo en 3D</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Color</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {SHIRT_COLORS.map((c) => (
              <button key={c.hex} onClick={() => setShirtColor(c.hex)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${shirtColor === c.hex ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="h-4 w-4 rounded-full border border-gray-300" style={{ background: c.hex }} />{c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Diseño</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-5 text-sm text-gray-500 transition hover:border-gray-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            {designImage ? 'Cambiar imagen' : 'Subir diseño'}
          </button>
          {designImage && <button onClick={() => setDesignImage(null)} className="mt-1 text-xs text-red-500">Eliminar</button>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Texto</label>
          <input type="text" value={designText} placeholder="Ej: Mi marca" onChange={(e) => setDesignText(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
          <input type="range" min="12" max="48" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="mt-2 w-full" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Posición del estampado</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(Object.entries(POSITION_LABELS) as [Position, string][]).map(([k, l]) => (
              <button key={k} onClick={() => setPosition(k)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${position === k ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Vistas rápidas */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Vista</label>
          <div className="mt-1.5 flex gap-2">
            {[{ a: -30, l: 'Izquierda' }, { a: 0, l: 'Frente' }, { a: 30, l: 'Derecha' }].map((v) => (
              <button key={v.a} onClick={() => setViewAngle(v.a)}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${viewAngle === v.a ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{v.l}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setDesignImage(null); setDesignText('') }}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600">Reiniciar</button>
          <button onClick={handleDownload} disabled={!designImage && !designText}
            className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white disabled:opacity-40">Descargar</button>
        </div>
      </div>
    </div>
  )
}
