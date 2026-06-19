'use client'

/**
 * ShaderViewer3D — Visor 3D con inyección de logo por shader (onBeforeCompile).
 * 
 * NO modifica el modelo GLB, NO fusiona geometrías, NO toca UVs.
 * 
 * Cómo funciona:
 * 1. Carga el GLB con su textura de tela original intacta (tiling, overlapping, etc.)
 * 2. Crea una segunda textura (canvas 2D) con el logo/diseño del usuario
 * 3. Intercepta el shader del material vía onBeforeCompile
 * 4. Usa fract(vUv) para normalizar las UVs de tiling a rango 0-1
 * 5. Dibuja el logo SOLO dentro de una zona delimitada (bounding box)
 * 6. Mezcla (alpha blending) el logo sobre la tela original
 * 
 * Resultado: textura de tela intacta + logo posicionado correctamente.
 */

import { useEffect, useRef, useState } from 'react'
import type { ThreeModules } from '@/lib/three-modules'

type Position = 'chest' | 'back' | 'sleeve-left' | 'sleeve-right'

// Zonas del logo en espacio UV normalizado (fract(vUv))
// Cada posición define un rectángulo [x_min, y_min, x_max, y_max] donde aparecerá el logo
const LOGO_BOUNDS: Record<Position, [number, number, number, number]> = {
  chest: [0.35, 0.35, 0.65, 0.65],
  back: [0.35, 0.35, 0.65, 0.65],
  'sleeve-left': [0.05, 0.40, 0.18, 0.60],
  'sleeve-right': [0.82, 0.40, 0.95, 0.60],
}

const DECAL_POS: Record<Position, [number, number, number]> = {
  chest: [0, 0.04, 0.08],
  back: [0, 0.04, -0.08],
  'sleeve-left': [-0.09, 0.05, 0],
  'sleeve-right': [0.09, 0.05, 0],
}

export default function ShaderViewer3D({
  modules,
  designImage,
  designText,
  fontSize,
  shirtColor,
  position,
  visible,
}: {
  modules: ThreeModules | null
  designImage: string | null
  designText: string
  fontSize: number
  shirtColor: string
  position: Position
  visible: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!modules || !containerRef.current || !canvasRef.current || !visible) return
    const { THREE, GLTFLoader, OrbitControls } = modules
    const container = containerRef.current

    // ─── 1. Escena ───
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100)
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = 2
    controls.minDistance = 0.5

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const kl = new THREE.DirectionalLight(0xffffff, 1.5); kl.position.set(3, 4, 5); scene.add(kl)
    const fl = new THREE.DirectionalLight(0xffffff, 0.5); fl.position.set(-3, 2, -4); scene.add(fl)

    // ─── 2. Canvas con el logo (1024x1024) ───
    const logoCanvas = document.createElement('canvas')
    logoCanvas.width = 1024; logoCanvas.height = 1024
    const lctx = logoCanvas.getContext('2d')!
    lctx.clearRect(0, 0, 1024, 1024)
    // Rellenar con color de camiseta para que coincida con la tela
    lctx.fillStyle = shirtColor; lctx.fillRect(0, 0, 1024, 1024)
    if (designImage) {
      const img = new Image(); img.src = designImage
      if (img.complete && img.width > 0) {
        const asp = img.width / img.height; let dw = 800, dh = 800
        if (asp > 1) dh = 800 / asp; else dw = 800 * asp
        lctx.drawImage(img, (1024 - dw) / 2, (1024 - dh) / 2, dw, dh)
      }
    }
    if (designText) {
      lctx.textAlign = 'center'; lctx.textBaseline = 'middle'; lctx.fillStyle = '#000'
      lctx.font = `bold ${fontSize * 4}px Arial`; lctx.fillText(designText, 512, 512)
    }
    const logoTexture = new THREE.CanvasTexture(logoCanvas)
    logoTexture.needsUpdate = true; logoTexture.premultiplyAlpha = false

    // ─── 3. Cargar GLB ───
    const loader = new GLTFLoader()
    loader.load('/models/camiseta-camiart.glb', (gltf: any) => {
      const model = gltf.scene
      let modelReady = false

      model.traverse((child: any) => {
        if (!child.isMesh || !child.material) return

        // Aplicar color base al material original
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => { m.color?.set(shirtColor) })
        } else {
          child.material.color?.set(shirtColor)
        }

        // ─── 4. Inyectar logo por shader (onBeforeCompile) ───
        const mat = Array.isArray(child.material) ? child.material[0] : child.material
        const logoBounds = LOGO_BOUNDS[position]

        mat.onBeforeCompile = (shader: any) => {
          // Uniformes del logo
          shader.uniforms.logoTexture = { value: logoTexture }
          shader.uniforms.logoBounds = { value: new THREE.Vector4(...logoBounds) }
          shader.uniforms.logoVisible = { value: 1.0 }

          // Inyectar uniformes al fragment shader
          shader.fragmentShader =
            'uniform sampler2D logoTexture;\n' +
            'uniform vec4 logoBounds;\n' +
            'uniform float logoVisible;\n' +
            shader.fragmentShader

          // Reemplazar la sección de mapa de textura para mezclar el logo
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `
            #include <map_fragment>

            // Inyección de logo por shader
            // fract() normaliza UVs de tiling (1.3 → 0.3) para que el logo no se repita
            vec2 logoUv = fract(vUv);

            if (logoVisible > 0.5 &&
                logoUv.x >= logoBounds.x && logoUv.x <= logoBounds.z &&
                logoUv.y >= logoBounds.y && logoUv.y <= logoBounds.w) {

              // Remapear coordenadas UV locales al espacio de la textura del logo
              vec2 localUv = (logoUv - logoBounds.xy) / (logoBounds.zw - logoBounds.xy);
              vec4 logoColor = texture2D(logoTexture, localUv);

              // Alpha blending: el PNG del usuario tiene transparencia
              diffuseColor = mix(diffuseColor, logoColor, logoColor.a);
            }
            `
          )
        }

        // Forzar recompilación del shader
        if (mat.onBeforeCompile) {
          // Disparar recompile forzando un cambio
          mat.customProgramCacheKey = () => String(Date.now())
        }

        if (!modelReady) {
          // Centrar modelo
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          model.position.sub(center)
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          camera.position.set(0, maxDim * 0.3, maxDim * 1.8)
          controls.target.set(0, maxDim * 0.15, 0)
          controls.update()

          scene.add(model)
          modelReady = true
          setReady(true)
        }
      })
    })

    // ─── 5. Animación ───
    let animId = 0
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // ─── 6. Resize ───
    const handleResize = () => {
      const w = container.clientWidth; const h = container.clientHeight
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
      try { renderer.dispose() } catch {}
      scene.clear()
    }
  }, [modules, visible])

  // Actualizar textura del logo en caliente
  useEffect(() => {
    if (!ready || !modules || !visible) return
    // Forzar re-render con el nuevo diseño
    setReady(false)
    setTimeout(() => setReady(true), 50)
  }, [designImage, designText, fontSize, shirtColor, position])

  if (!visible) return null

  return (
    <div ref={containerRef} className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 shadow-sm lg:min-h-[500px]">
      <canvas ref={canvasRef} className="h-full w-full" />
      {!modules && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-gray-400">Cargando visor 3D...</span>
        </div>
      )}
    </div>
  )
}
