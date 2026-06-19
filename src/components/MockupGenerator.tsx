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

const POSITION_POSITIONS: Record<Position, { x: number; y: number; z: number; rotation: [number, number, number] }> = {
  chest: { x: 0, y: 0.08, z: 0.12, rotation: [0, 0, 0] },
  back: { x: 0, y: 0.08, z: -0.12, rotation: [0, Math.PI, 0] },
  'sleeve-left': { x: -0.12, y: 0.1, z: 0, rotation: [0, -Math.PI / 2, 0] },
  'sleeve-right': { x: 0.12, y: 0.1, z: 0, rotation: [0, Math.PI / 2, 0] },
}

export default function MockupGenerator() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [modules, setModules] = useState<ThreeModules | null>(null)
  const [loading, setLoading] = useState(true)
  const [designImage, setDesignImage] = useState<string | null>(null)
  const [designText, setDesignText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [position, setPosition] = useState<Position>('chest')
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const modelRef = useRef<any>(null)
  const decalRef = useRef<any>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    import('@/lib/three-modules').then(async (mod) => {
      try {
        setModules(await mod.ensureThreeModules())
      } catch {
        setModules(null)
      }
    })
  }, [])

  const renderDecal = useCallback(async () => {
    if (!modules || !modelRef.current || !sceneRef.current) return

    const { THREE, DecalGeometry } = modules

    // Remove old decal
    if (decalRef.current) {
      sceneRef.current.remove(decalRef.current)
      decalRef.current.geometry?.dispose()
      decalRef.current.material?.dispose()
      decalRef.current = null
    }

    // Create canvas with design
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 512, 512)

    // Draw uploaded image
    if (designImage) {
      const img = new Image()
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const size = Math.min(img.width, img.height)
          const sx = (img.width - size) / 2
          const sy = (img.height - size) / 2
          ctx.drawImage(img, sx, sy, size, size, 64, 64, 384, 384)
          resolve()
        }
        img.src = designImage
      })
    }

    // Draw text
    if (designText) {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#000000'
      ctx.font = `bold ${fontSize}px Arial, sans-serif`

      const words = designText.split(' ')
      const lines: string[] = []
      let currentLine = ''
      for (const word of words) {
        const test = currentLine + word + ' '
        if (ctx.measureText(test).width > 380) {
          lines.push(currentLine.trim())
          currentLine = word + ' '
        } else {
          currentLine = test
        }
      }
      lines.push(currentLine.trim())

      const lineHeight = fontSize * 1.2
      const startY = 256 - ((lines.length - 1) * lineHeight) / 2
      lines.forEach((line, i) => {
        ctx.fillText(line, 256, startY + i * lineHeight)
      })
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    })

    const pos = POSITION_POSITIONS[position]
    const size = new THREE.Vector3(0.25, 0.25, 0.25)
    const positionVec = new THREE.Vector3(pos.x, pos.y, pos.z)
    const rotation = new THREE.Euler(pos.rotation[0], pos.rotation[1], pos.rotation[2])
    const normal = new THREE.Vector3(0, 0, 1).applyEuler(rotation)

    const geometry = new DecalGeometry(modelRef.current, positionVec, rotation, size)

    const mesh = new THREE.Mesh(geometry, material)
    sceneRef.current.add(mesh)
    decalRef.current = mesh
  }, [modules, designImage, designText, fontSize, position])

  useEffect(() => {
    if (!modules || !containerRef.current) return
    const { THREE, GLTFLoader, OrbitControls } = modules

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100)
    camera.position.set(0, 0.5, 3.5)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, alpha: true, antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = true
    controls.autoRotateSpeed = 2
    controls.minDistance = 1.5
    controls.maxDistance = 6
    controls.target.set(0, 0.3, 0)
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(2, 3, 4)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-2, 1, -3)
    scene.add(fillLight)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
    rimLight.position.set(0, -1, 3)
    scene.add(rimLight)

    const loader = new GLTFLoader()
    loader.load('/models/camiseta-camiart.glb', (gltf: any) => {
      const model = gltf.scene
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      model.position.y += 0.3
      modelRef.current = model
      scene.add(model)
      setLoading(false)
    })

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animFrameRef.current)
      renderer.dispose()
    }
  }, [modules])

  useEffect(() => {
    if (!loading) renderDecal()
  }, [renderDecal, loading])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setDesignImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'camiseta-diseno.png'
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* 3D Preview */}
      <div ref={containerRef} className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white shadow-sm lg:aspect-auto lg:min-h-[500px]">
        <canvas ref={canvasRef} className="h-full w-full" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <span className="text-sm text-gray-500">Cargando diseñador...</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Diseña tu camiseta</h3>
          <p className="text-sm text-gray-500">Sube tu diseño o añade texto</p>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Tu diseño</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 transition hover:border-gray-400 hover:text-gray-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            {designImage ? 'Cambiar imagen' : 'Subir diseño (PNG, JPG)'}
          </button>
          {designImage && (
            <button onClick={() => setDesignImage(null)} className="mt-1 text-xs text-red-500 hover:text-red-600">
              Eliminar imagen
            </button>
          )}
        </div>

        {/* Text input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Texto</label>
          <input
            type="text" value={designText} placeholder="Ej: Mi marca"
            onChange={(e) => setDesignText(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="mt-2 flex items-center gap-3">
            <label className="text-xs text-gray-500">Tamaño:</label>
            <input type="range" min="12" max="48" value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="flex-1" />
            <span className="text-xs font-medium text-gray-600">{fontSize}px</span>
          </div>
        </div>

        {/* Position selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Posición</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(Object.entries(POSITION_LABELS) as [Position, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setPosition(key)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                  position === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => { setDesignImage(null); setDesignText('') }}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Reiniciar
          </button>
          <button
            onClick={handleDownload}
            disabled={!designImage && !designText}
            className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Descargar
          </button>
        </div>
      </div>
    </div>
  )
}
