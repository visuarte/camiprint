'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type Position = 'chest' | 'back' | 'sleeve-left' | 'sleeve-right'

const POSITION_LABELS: Record<Position, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  'sleeve-left': 'Manga izquierda',
  'sleeve-right': 'Manga derecha',
}

const SHIRT_COLORS = [
  { name: 'Blanco', hex: '#f5f5f0' },
  { name: 'Negro', hex: '#222222' },
  { name: 'Gris', hex: '#999999' },
  { name: 'Azul Marino', hex: '#1a2a3a' },
  { name: 'Rojo', hex: '#cc3333' },
  { name: 'Verde', hex: '#2d7d46' },
]

// Coordenadas de la silueta de la camiseta (normalizadas 0-1)
const SHIRT_POLYGON: [number, number][] = [
  [0.35, 0.02], [0.65, 0.02], [0.92, 0.10], [0.85, 0.30],
  [0.88, 0.70], [0.90, 0.95], [0.10, 0.95], [0.12, 0.70],
  [0.15, 0.30], [0.08, 0.10],
]

const CUFF_POLYGON: [number, number][] = [
  [0.42, 0.04], [0.50, 0.12], [0.58, 0.04],
]

// Zonas de estampado por posición (normalizadas 0-1)
const STAMP_ZONES: Record<Position, { x: number; y: number; w: number; h: number }> = {
  chest: { x: 0.20, y: 0.22, w: 0.60, h: 0.38 },
  back: { x: 0.20, y: 0.22, w: 0.60, h: 0.38 },
  'sleeve-left': { x: 0.03, y: 0.18, w: 0.12, h: 0.20 },
  'sleeve-right': { x: 0.85, y: 0.18, w: 0.12, h: 0.20 },
}

function drawShirtPreview(
  canvas: HTMLCanvasElement,
  shirtColor: string,
  designImage: string | null,
  designText: string,
  fontSize: number,
  position: Position,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)

  const toPx = (x: number, y: number) => [x * W, y * H] as const

  // Dibujar silueta de la camiseta
  ctx.beginPath()
  const [sx, sy] = toPx(SHIRT_POLYGON[0][0], SHIRT_POLYGON[0][1])
  ctx.moveTo(sx, sy)
  for (let i = 1; i < SHIRT_POLYGON.length; i++) {
    const [px, py] = toPx(SHIRT_POLYGON[i][0], SHIRT_POLYGON[i][1])
    ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = shirtColor
  ctx.fill()
  ctx.strokeStyle = 'rgba(150,150,150,0.4)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Cuello
  ctx.beginPath()
  const [cx1, cy1] = toPx(CUFF_POLYGON[0][0], CUFF_POLYGON[0][1])
  const [cx2, cy2] = toPx(CUFF_POLYGON[1][0], CUFF_POLYGON[1][1])
  const [cx3, cy3] = toPx(CUFF_POLYGON[2][0], CUFF_POLYGON[2][1])
  ctx.moveTo(cx1, cy1)
  ctx.lineTo(cx2, cy2)
  ctx.lineTo(cx3, cy3)
  ctx.closePath()
  ctx.fillStyle = shirtColor
  ctx.fill()
  ctx.strokeStyle = 'rgba(150,150,150,0.4)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Zona de estampado
  const zone = STAMP_ZONES[position]
  const zx = zone.x * W, zy = zone.y * H, zw = zone.w * W, zh = zone.h * H

  // Si hay diseño, dibujarlo dentro de la zona
  if (designImage) {
    const img = new Image()
    img.onload = () => {
      const aspect = img.width / img.height
      let dw = zw * 0.9, dh = zh * 0.9
      if (aspect > 1) dh = dw / aspect
      else dw = dh * aspect
      const dx = zx + (zw - dw) / 2
      const dy = zy + (zh - dh) / 2
      ctx.save()
      ctx.beginPath()
      ctx.rect(zx, zy, zw, zh)
      ctx.clip()
      ctx.drawImage(img, dx, dy, dw, dh)
      ctx.restore()
    }
    img.src = designImage
  }

  // Texto
  if (designText) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(zx, zy, zw, zh)
    ctx.clip()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000000'
    const maxWidth = zw * 0.85
    const words = designText.split(' ')
    const lines: string[] = []
    let currentLine = ''
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    for (const word of words) {
      const test = currentLine + word + ' '
      if (ctx.measureText(test).width > maxWidth) {
        lines.push(currentLine.trim())
        currentLine = word + ' '
      } else {
        currentLine = test
      }
    }
    lines.push(currentLine.trim())
    const lh = fontSize * 1.3
    const sy2 = zy + zh / 2 - ((lines.length - 1) * lh) / 2
    lines.forEach((line, i) => ctx.fillText(line, zx + zw / 2, sy2 + i * lh))
    ctx.restore()
  }

  // Borde de zona (sutil)
  ctx.strokeStyle = 'rgba(200,100,50,0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.strokeRect(zx, zy, zw, zh)
  ctx.setLineDash([])

  // Etiqueta de posición
  ctx.fillStyle = 'rgba(150,150,150,0.5)'
  ctx.font = '11px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(POSITION_LABELS[position], W / 2, H - 10)
}

export default function MockupGenerator() {
  const previewRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [designImage, setDesignImage] = useState<string | null>(null)
  const [designText, setDesignText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [position, setPosition] = useState<Position>('chest')
  const [shirtColor, setShirtColor] = useState('#f5f5f0')
  const [baking, setBaking] = useState(false)
  const [glbUrl, setGlbUrl] = useState<string | null>(null)

  // Referencia para la imagen del diseño actual (para re-bake)
  const designDataUrlRef = useRef<string | null>(null)

  const redraw = useCallback(() => {
    if (previewRef.current) {
      drawShirtPreview(previewRef.current, shirtColor, designImage, designText, fontSize, position)
    }
  }, [shirtColor, designImage, designText, fontSize, position])

  useEffect(() => { redraw() }, [redraw])

  // Redibujar cuando se cargue la imagen (el onload es async)
  useEffect(() => {
    if (designImage) {
      const img = new Image()
      img.onload = () => redraw()
      img.src = designImage
    }
  }, [designImage, redraw])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const r = new FileReader()
      r.onload = () => setDesignImage(r.result as string)
      r.readAsDataURL(file)
    }
  }

  const handleDownload = () => {
    if (!previewRef.current) return
    const link = document.createElement('a')
    link.download = 'camiseta-diseno.png'
    link.href = previewRef.current.toDataURL('image/png')
    link.click()
  }

  const handleBake3D = async () => {
    if (!designImage && !designText) return
    setBaking(true)
    try {
      // Convertir diseño a blob
      const canvas = document.createElement('canvas')
      canvas.width = 512; canvas.height = 512
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = shirtColor
      ctx.fillRect(0, 0, 512, 512)
      if (designImage) {
        const img = new Image()
        await new Promise<void>((resolve) => { img.onload = () => { ctx.drawImage(img, 0, 0, 512, 512); resolve() }; img.src = designImage })
      }
      if (designText) {
        ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.font = `bold ${fontSize}px Arial`
        ctx.fillText(designText, 256, 256)
      }
      const blob = await new Promise<Blob>((r) => canvas.toBlob(r as any, 'image/png'))

      const form = new FormData()
      form.append('design', blob, 'design.png')
      form.append('color', shirtColor)
      form.append('position', position)

      const res = await fetch('/api/designer/bake', { method: 'POST', body: form })
      const data = await res.json()
      if (data.ok) {
        setGlbUrl(data.glbUrl + '?t=' + Date.now())
      }
    } catch (err) {
      console.error('[MockupGenerator] Error baking 3D:', err)
    } finally {
      setBaking(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Preview 2D */}
      <div className="flex items-center justify-center rounded-2xl bg-gradient-to-b from-gray-50 to-white p-4 shadow-sm">
        <canvas
          ref={previewRef}
          width={500}
          height={650}
          className="h-auto w-full max-w-[500px] rounded-lg"
        />
      </div>

      {/* Controles */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Diseña tu camiseta</h3>
          <p className="text-sm text-gray-500">Sube tu diseño o añade texto</p>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Color de la camiseta</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {SHIRT_COLORS.map((c) => (
              <button key={c.hex} onClick={() => setShirtColor(c.hex)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                  shirtColor === c.hex ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <span className="h-4 w-4 rounded-full border border-gray-300" style={{ background: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Tu diseño (PNG con transparencia)</label>
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

        {/* Texto */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Texto</label>
          <input type="text" value={designText} placeholder="Ej: Mi marca" onChange={(e) => setDesignText(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
          <div className="mt-2 flex items-center gap-3">
            <label className="text-xs text-gray-500">Tamaño:</label>
            <input type="range" min="12" max="48" value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))} className="flex-1" />
            <span className="text-xs font-medium text-gray-600">{fontSize}px</span>
          </div>
        </div>

        {/* Posición */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Posición</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(Object.entries(POSITION_LABELS) as [Position, string][]).map(([k, l]) => (
              <button key={k} onClick={() => setPosition(k)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                  position === k ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button onClick={() => { setDesignImage(null); setDesignText('') }}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600">Reiniciar</button>
          <button onClick={handleDownload} disabled={!designImage && !designText}
            className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white disabled:opacity-40">Descargar</button>
        </div>

        {/* Botón 3D */}
        {(designImage || designText) && (
          <button onClick={handleBake3D} disabled={baking}
            className="w-full rounded-xl border-2 border-blue-200 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-40">
            {baking ? '🔄 Generando vista 3D...' : '🔄 Ver en 3D'}
          </button>
        )}

        {/* Visor 3D del GLB texturizado */}
        {glbUrl && (
          <div className="mt-4">
            <details open>
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Vista 3D — arrastra para rotar
              </summary>
              <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white">
                <iframe
                  src={`https://gltf-viewer.pages.dev/?url=${encodeURIComponent(window.location.origin + glbUrl)}&autorotate`}
                  className="h-full w-full"
                  title="Vista 3D de la camiseta"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
