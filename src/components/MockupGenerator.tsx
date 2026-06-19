'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ShaderViewer3D from '@/components/ShaderViewer3D'
import type { ThreeModules } from '@/lib/three-modules'

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
  const p = (x: number, y: number) => [x * W, y * H] as const
  ctx.beginPath()
  const [sx, sy] = p(SHIRT_POLYGON[0][0], SHIRT_POLYGON[0][1]); ctx.moveTo(sx, sy)
  for (let i = 1; i < SHIRT_POLYGON.length; i++) { const [x, y] = p(SHIRT_POLYGON[i][0], SHIRT_POLYGON[i][1]); ctx.lineTo(x, y) }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = 'rgba(150,150,150,0.3)'; ctx.lineWidth = 1; ctx.stroke()
  ctx.beginPath(); const [cx, cy] = p(CUFF[0][0], CUFF[0][1]); ctx.moveTo(cx, cy)
  for (let i = 1; i < CUFF.length; i++) { const [x, y] = p(CUFF[i][0], CUFF[i][1]); ctx.lineTo(x, y) }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.stroke()
  const zx = W * 0.25, zy = H * 0.25, zw = W * 0.50, zh = H * 0.35
  if (img) {
    const i = new Image(); i.src = img
    if (i.complete && i.width > 0) {
      const asp = i.width / i.height; let dw = zw * 0.85, dh = zh * 0.85
      if (asp > 1) dh = dw / asp; else dw = dh * asp
      ctx.save(); ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip()
      ctx.drawImage(i, zx + (zw - dw) / 2, zy + (zh - dh) / 2, dw, dh); ctx.restore()
    }
  }
  if (text) {
    ctx.save(); ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip()
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'
    ctx.font = `bold ${fs}px Arial`
    const words = text.split(' '), lines: string[] = []; let cl = ''
    for (const w of words) { const t = cl + w + ' '; if (ctx.measureText(t).width > zw * 0.85) { lines.push(cl.trim()); cl = w + ' ' } else cl = t }
    lines.push(cl.trim()); const lh = fs * 1.3, sy2 = zy + zh / 2 - ((lines.length - 1) * lh) / 2
    lines.forEach((l, i) => ctx.fillText(l, zx + zw / 2, sy2 + i * lh)); ctx.restore()
  }
}

export default function MockupGenerator() {
  const previewRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [designImage, setDesignImage] = useState<string | null>(null)
  const [designText, setDesignText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [position, setPosition] = useState<Position>('chest')
  const [shirtColor, setShirtColor] = useState('#f5f5f0')
  const [show3d, setShow3d] = useState(false)
  const [modules, setModules] = useState<ThreeModules | null>(null)

  const redraw = useCallback(() => {
    if (!previewRef.current) return
    const ctx = previewRef.current.getContext('2d')
    if (!ctx) return
    drawShirt(ctx, 500, 500, shirtColor, designImage, designText, fontSize)
  }, [shirtColor, designImage, designText, fontSize])
  useEffect(() => { redraw() }, [redraw])
  useEffect(() => {
    if (!designImage) return
    const img = new Image(); img.onload = () => redraw(); img.onerror = () => redraw(); img.src = designImage
  }, [designImage, redraw])

  useEffect(() => {
    if (!show3d) return
    import('@/lib/three-modules').then(async (m) => { try { setModules(await m.ensureThreeModules()) } catch {} })
  }, [show3d])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = () => setDesignImage(r.result as string); r.readAsDataURL(file) }
  }
  const handleDownload = () => {
    if (!previewRef.current) return
    const link = document.createElement('a'); link.download = 'camiseta-diseno.png'
    link.href = previewRef.current.toDataURL('image/png'); link.click()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        {show3d ? (
          <ShaderViewer3D modules={modules} designImage={designImage} designText={designText}
            fontSize={fontSize} shirtColor={shirtColor} position={position} visible={show3d} />
        ) : (
          <canvas ref={previewRef} width={500} height={500} className="w-full rounded-2xl bg-gradient-to-b from-gray-50 to-white shadow-sm" />
        )}
        <div className="mt-2 text-center text-xs text-gray-400">
          {show3d ? 'Arrastra para rotar · Rueda para zoom' : 'Vista previa 2D'}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Diseña tu camiseta</h3>
          <p className="text-sm text-gray-500">Sube tu diseño o añade texto</p>
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
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Posición</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(Object.entries(POSITION_LABELS) as [Position, string][]).map(([k, l]) => (
              <button key={k} onClick={() => setPosition(k)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${position === k ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setDesignImage(null); setDesignText('') }}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600">Reiniciar</button>
          <button onClick={handleDownload} disabled={!designImage && !designText}
            className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white disabled:opacity-40">Descargar</button>
        </div>

        {(designImage || designText) && (
          <button onClick={() => setShow3d(!show3d)}
            className="w-full rounded-xl border-2 border-blue-200 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
            {show3d ? '◀ Volver a vista 2D' : '🔄 Ver en 3D'}
          </button>
        )}
      </div>
    </div>
  )
}
