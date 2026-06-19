'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ThreeModules } from '@/lib/three-modules'

interface ProductViewer3DProps {
  modelSrc?: string
  fallbackImage?: string
  autoRotate?: boolean
  className?: string
}

export default function ProductViewer3D({
  modelSrc = '/models/camiseta-camiart.glb',
  fallbackImage,
  autoRotate = true,
  className = '',
}: ProductViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const modelRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const animFrameRef = useRef<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modules, setModules] = useState<ThreeModules | null>(null)

  useEffect(() => {
    import('@/lib/three-modules').then(async (mod) => {
      try {
        const loaded = await mod.ensureThreeModules()
        setModules(loaded)
      } catch {
        setModules(null)
      }
    })
  }, [])

  const initScene = useCallback(async () => {
    if (!modules || !containerRef.current) return

    const { THREE, GLTFLoader, OrbitControls } = modules

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100)
    camera.position.set(0, 0.5, 3.5)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current!,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = 2.5
    controls.minDistance = 1.5
    controls.maxDistance = 6
    controls.target.set(0, 0.3, 0)
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(2, 3, 4)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-2, 1, -3)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
    rimLight.position.set(0, -1, 3)
    scene.add(rimLight)

    const loader = new GLTFLoader()
    try {
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(modelSrc, resolve, undefined, reject)
      })

      const model = gltf.scene
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          if (child.material) {
            child.material.roughness = Math.min(child.material.roughness ?? 0.5, 0.6)
            child.material.metalness = Math.min(child.material.metalness ?? 0.1, 0.1)
          }
        }
      })

      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      model.position.y += 0.3

      modelRef.current = model
      scene.add(model)
      setLoading(false)
    } catch {
      setError('No se pudo cargar el modelo 3D')
      setLoading(false)
    }

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
  }, [modules, modelSrc, autoRotate])

  useEffect(() => {
    if (!modules) return
    const cleanup = initScene()
    return () => { cleanup.then((fn) => fn?.()) }
  }, [modules, initScene])

  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate
    }
  }

  const resetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0.5, 3.5)
      controlsRef.current.target.set(0, 0.3, 0)
      controlsRef.current.update()
    }
  }

  const zoomIn = () => {
    if (cameraRef.current && controlsRef.current) {
      const dir = new (modules?.THREE?.Vector3 ?? (window as any).THREE.Vector3)()
      cameraRef.current.getWorldDirection(dir)
      cameraRef.current.position.add(dir.multiplyScalar(-0.3))
      controlsRef.current.update()
    }
  }

  const zoomOut = () => {
    if (cameraRef.current && controlsRef.current) {
      const dir = new (modules?.THREE?.Vector3 ?? (window as any).THREE.Vector3)()
      cameraRef.current.getWorldDirection(dir)
      cameraRef.current.position.add(dir.multiplyScalar(0.3))
      controlsRef.current.update()
    }
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-gray-50 to-white ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <span className="text-sm text-gray-500">Cargando visualizador 3D...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <p className="text-sm text-red-500">{error}</p>
            {fallbackImage && (
              <img src={fallbackImage} alt="Producto" className="mt-4 h-64 object-contain" />
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
        <button onClick={toggleAutoRotate} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" title="Auto-rotar">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </button>
        <button onClick={zoomIn} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" title="Acercar">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        </button>
        <button onClick={zoomOut} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" title="Alejar">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M8 11h6" />
          </svg>
        </button>
        <button onClick={resetView} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" title="Restaurar vista">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
