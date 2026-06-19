'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ThreeModules } from '@/lib/three-modules'

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

function checkWebGL(): boolean {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('webgl2')) }
  catch { return false }
}

export default function MockupGenerator() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [modules, setModules] = useState<ThreeModules | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [webglError, setWebglError] = useState(false)
  const [designImage, setDesignImage] = useState<string | null>(null)
  const [designText, setDesignText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [position, setPosition] = useState<Position>('chest')
  const [shirtColor, setShirtColor] = useState('#f5f5f0')
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const modelRef = useRef<any>(null)
  const decalRef = useRef<any>(null)
  const animFrameRef = useRef<number>(0)
  const mountedRef = useRef(true)
  const modelExtentsRef = useRef<{ maxDim: number }>({ maxDim: 2 })

  useEffect(() => {
    if (!checkWebGL()) { setWebglError(true); setLoading(false); console.warn('[MockupGenerator] WebGL no disponible') }
  }, [])

  useEffect(() => {
    let cancelled = false
    import('@/lib/three-modules').then(async (mod) => {
      try {
        const loaded = await mod.ensureThreeModules()
        if (!cancelled) setModules(loaded)
      } catch (err) {
        console.error('[MockupGenerator] Error cargando Three.js:', err)
        if (!cancelled) { setError('Error al cargar el motor 3D'); setLoading(false) }
      }
    })
    return () => { cancelled = true; mountedRef.current = false }
  }, [])

  const getDecalConfig = useCallback((modelDim: number) => {
    // Las posiciones son relativas al tamaño del modelo
    const s = modelDim // escala de referencia
    return {
      chest: { pos: [0, s * 0.04, s * 0.08], rot: [0, 0, 0], size: s * 0.18 },
      back: { pos: [0, s * 0.04, -s * 0.08], rot: [0, Math.PI, 0], size: s * 0.18 },
      'sleeve-left': { pos: [-s * 0.09, s * 0.05, 0], rot: [0, -Math.PI / 2, 0], size: s * 0.1 },
      'sleeve-right': { pos: [s * 0.09, s * 0.05, 0], rot: [0, Math.PI / 2, 0], size: s * 0.1 },
    }
  }, [])

  const renderDecal = useCallback(async () => {
    if (!modules || !modelRef.current || !sceneRef.current) return
    const { THREE, DecalGeometry } = modules
    const modelDim = modelExtentsRef.current.maxDim

    try {
      if (decalRef.current) {
        sceneRef.current.remove(decalRef.current)
        decalRef.current.geometry?.dispose()
        decalRef.current.material?.dispose()
        decalRef.current = null
      }

      const decalCfg = getDecalConfig(modelDim)
      const cfg = decalCfg[position]
      if (!cfg) return

      const canvas = document.createElement('canvas')
      canvas.width = 512; canvas.height = 512
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, 512, 512)

      // Fondo transparente con marca de agua sutil
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(0, 0, 512, 512)

      if (designImage) {
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Ajustar la imagen al centro con padding, manteniendo aspect ratio
            const padding = 40
            const drawSize = 512 - padding * 2
            const aspect = img.width / img.height
            let dw = drawSize, dh = drawSize
            if (aspect > 1) { dh = drawSize / aspect } else { dw = drawSize * aspect }
            const dx = (512 - dw) / 2, dy = (512 - dh) / 2
            ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh)
            resolve()
          }
          img.onerror = reject
          img.src = designImage
        })
      }

      if (designText) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#000000'
        ctx.font = `bold ${fontSize}px Arial, sans-serif`
        const words = designText.split(' ')
        const lines: string[] = []
        let currentLine = ''
        for (const word of words) {
          const test = currentLine + word + ' '
          if (ctx.measureText(test).width > 380) { lines.push(currentLine.trim()); currentLine = word + ' ' }
          else { currentLine = test }
        }
        lines.push(currentLine.trim())
        const lh = fontSize * 1.2
        const sy = 256 - ((lines.length - 1) * lh) / 2
        lines.forEach((line, i) => ctx.fillText(line, 256, sy + i * lh))
      }

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true

      const material = new THREE.MeshStandardMaterial({
        map: texture, transparent: true, depthTest: true, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -1, side: THREE.DoubleSide,
      })

      const [px, py, pz] = cfg.pos
      const [rx, ry, rz] = cfg.rot
      const size = cfg.size
      const posVec = new THREE.Vector3(px, py, pz)
      const rotEuler = new THREE.Euler(rx, ry, rz)
      const geo = new DecalGeometry(modelRef.current, posVec, rotEuler, new THREE.Vector3(size, size, size))

      const mesh = new THREE.Mesh(geo, material)
      sceneRef.current.add(mesh)
      decalRef.current = mesh
    } catch (err) {
      console.error('[MockupGenerator] Error renderizando decal:', err)
    }
  }, [modules, designImage, designText, fontSize, position, getDecalConfig])

  useEffect(() => {
    if (!modules || !containerRef.current || webglError) return
    const { THREE, GLTFLoader, OrbitControls } = modules

    try {
      const scene = new THREE.Scene()
      sceneRef.current = scene
      const container = containerRef.current
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 1000)
      cameraRef.current = camera

      if (!canvasRef.current) { setError('Error de inicialización'); setLoading(false); return }

      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true, powerPreference: 'low-power' })
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2
      rendererRef.current = renderer

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true; controls.dampingFactor = 0.08
      controls.autoRotate = true; controls.autoRotateSpeed = 2
      controlsRef.current = controls

      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 5); scene.add(key)
      const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-3, 2, -4); scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffffff, 0.8); rim.position.set(0, -2, 4); scene.add(rim)

      const loader = new GLTFLoader()
      let timedOut = false
      const timeoutId = setTimeout(() => { timedOut = true; setError('Timeout cargando modelo'); setLoading(false) }, 30000)

      loader.load('/models/camiseta-camiart.glb',
        (gltf: any) => {
          clearTimeout(timeoutId)
          if (timedOut || !mountedRef.current) return
          try {
            const model = gltf.scene

            // NO escalar el modelo — mantener su escala original
            // Guardar las mallas para poder cambiar color después
            const meshes: any[] = []
            model.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = true; child.receiveShadow = true
                meshes.push(child)
              }
            })

            // Centrar modelo
            const box = new THREE.Box3().setFromObject(model)
            const size = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            modelExtentsRef.current = { maxDim }

            // Posicionar cámara según tamaño del modelo
            const camDist = maxDim * 1.8
            camera.position.set(0, maxDim * 0.3, camDist)
            controls.target.set(0, maxDim * 0.15, 0)
            controls.minDistance = maxDim * 0.5
            controls.maxDistance = maxDim * 4
            controls.update()

            const center = box.getCenter(new THREE.Vector3())
            model.position.sub(center)

            modelRef.current = model
            scene.add(model)
            setLoading(false)
            console.log('[MockupGenerator] Modelo cargado. Dim:', maxDim.toFixed(2), 'Cámara:', camDist.toFixed(2))
          } catch (err) {
            console.error('[MockupGenerator] Error:', err); setError('Error procesando modelo'); setLoading(false)
          }
        },
        undefined,
        (err: any) => {
          clearTimeout(timeoutId); setError('No se pudo cargar el modelo 3D'); setLoading(false)
          console.error('[MockupGenerator] Error carga:', err?.message || err)
        }
      )

      const animate = () => {
        if (!mountedRef.current) return
        animFrameRef.current = requestAnimationFrame(animate)
        controls.update(); renderer.render(scene, camera)
      }
      animate()

      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
        const w = containerRef.current.clientWidth, h = containerRef.current.clientHeight
        camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
      }
      window.addEventListener('resize', handleResize)

      return () => {
        clearTimeout(timeoutId); window.removeEventListener('resize', handleResize)
        cancelAnimationFrame(animFrameRef.current); try { renderer.dispose() } catch {}
      }
    } catch (err) {
      console.error('[MockupGenerator] Error init:', err); setError('Error al inicializar'); setLoading(false)
    }
  }, [modules, webglError])

  useEffect(() => {
    if (!loading && !error && !webglError) renderDecal()
  }, [renderDecal, loading, error, webglError])

  useEffect(() => {
    // Cambiar color de la camiseta — busca el material principal y cambia su color
    if (!modelRef.current || !modules) return
    modelRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => { if (m.color) m.color.set(shirtColor) })
        } else {
          if (child.material.color) child.material.color.set(shirtColor)
        }
      }
    })
  }, [shirtColor, modules])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = () => setDesignImage(r.result as string); r.readAsDataURL(file) }
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a'); link.download = 'camiseta-diseno.png'
    link.href = canvasRef.current.toDataURL('image/png'); link.click()
  }

  const showFallback = error || webglError

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div ref={containerRef} className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white shadow-sm lg:aspect-auto lg:min-h-[500px]">
        {!showFallback && <canvas ref={canvasRef} className="h-full w-full" />}
        {loading && !showFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <span className="text-sm text-gray-500">Cargando diseñador...</span>
            </div>
          </div>
        )}
        {showFallback && (
          <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
            <p className="text-sm font-medium text-gray-700">{webglError ? 'WebGL no disponible' : error || 'Visor no disponible'}</p>
            {designImage && <img src={designImage} alt="Diseño" className="mt-4 max-h-48 rounded-lg border object-contain" />}
            {designText && !designImage && <p className="mt-4 text-2xl font-bold text-gray-800" style={{ fontSize }}>{designText}</p>}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Diseña tu camiseta</h3>
          <p className="text-sm text-gray-500">Sube tu diseño o añade texto</p>
        </div>

        {/* Color de la camiseta */}
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
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Tu diseño</label>
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
          <input type="range" min="12" max="48" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="mt-2 w-full" />
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
      </div>
    </div>
  )
}
