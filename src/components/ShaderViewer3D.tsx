'use client'

/**
 * ShaderViewer3D — Proyección de logo por shader con matriz de proyector.
 * 
 * NO usa UVs del modelo para el logo.
 * NO modifica el GLB.
 * NO fusiona geometrías.
 * 
 * Cómo funciona:
 * 1. Reemplaza el material del modelo por un ShaderMaterial personalizado
 * 2. El fragment shader muestrea la textura base de tela con las UVs originales
 * 3. Una segunda textura (el logo del usuario) se proyecta mediante una matriz
 *    de proyección que transforma coordenadas mundo → espacio local del logo
 * 4. El logo aparece solo donde el fragmento cae dentro del cubo del proyector
 * 5. La posición/orientación del logo se controla con Matrix4 (0ms CPU)
 * 
 * Basado en: Decal Projection Shader (Screen-Space Object Projection)
 */

import { useEffect, useRef } from 'react'
import type { ThreeModules } from '@/lib/three-modules'

type Position = 'chest' | 'back' | 'sleeve-left' | 'sleeve-right'

// Posiciones del proyector en coordenadas mundo (relativas al modelo centrado)
// [x, y, z] = [horizontal, altura, profundidad]
const PROJ_POS: Record<Position, [number, number, number]> = {
  chest: [0, 0.05, 0.08],
  back: [0, 0.05, -0.08],
  'sleeve-left': [-0.09, 0.05, 0],
  'sleeve-right': [0.09, 0.05, 0],
}

// Escala del proyector [ancho, alto, profundidad]
const PROJ_SCALE: Record<Position, [number, number, number]> = {
  chest: [0.22, 0.25, 0.05],
  back: [0.22, 0.25, 0.05],
  'sleeve-left': [0.10, 0.14, 0.05],
  'sleeve-right': [0.10, 0.14, 0.05],
}

const VERTEX_SHADER = `
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const FRAGMENT_SHADER = `
  uniform sampler2D uBaseTex;
  uniform sampler2D uLogoTex;
  uniform mat4 uProjMatrix;

  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    // 1. Color base de la tela con UVs originales (tiling incluido)
    vec4 baseColor = texture2D(uBaseTex, vUv);

    // 2. Transformar posición mundo → espacio local del proyector
    vec4 projSpace = uProjMatrix * vec4(vWorldPosition, 1.0);

    // 3. Convertir de [-0.5, 0.5] a [0.0, 1.0] para UV de textura
    vec2 logoUv = projSpace.xy + 0.5;

    // 4. Dibujar logo SOLO si estamos dentro del cubo del proyector
    if (logoUv.x >= 0.0 && logoUv.x <= 1.0 &&
        logoUv.y >= 0.0 && logoUv.y <= 1.0 &&
        projSpace.z > -0.5 && projSpace.z < 0.5) {

      vec4 logoColor = texture2D(uLogoTex, logoUv);

      // Alpha blending sobre la tela
      baseColor.rgb = mix(baseColor.rgb, logoColor.rgb, logoColor.a);
    }

    gl_FragColor = baseColor;
  }
`

function buildProjectorMatrix(THREE: any, pos: [number, number, number], scale: [number, number, number]): any {
  const m = new THREE.Matrix4()
  const p = new THREE.Vector3(pos[0], pos[1], pos[2])
  const s = new THREE.Vector3(scale[0], scale[1], scale[2])
  const q = new THREE.Quaternion()
  m.compose(p, q, s)
  return m.invert()
}

export default function ShaderViewer3D({
  modules, designImage, designText, fontSize, shirtColor, position, visible,
}: {
  modules: ThreeModules | null; designImage: string | null; designText: string
  fontSize: number; shirtColor: string; position: Position; visible: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const materialRef = useRef<any>(null)

  useEffect(() => {
    if (!modules || !containerRef.current || !canvasRef.current || !visible) return
    const { THREE, GLTFLoader, OrbitControls } = modules
    const container = containerRef.current

    // Escena
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf0f0f0)
    sceneRef.current = scene
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.01, 100)
    cameraRef.current = camera
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = 2
    controlsRef.current = controls

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const kl = new THREE.DirectionalLight(0xffffff, 1.5); kl.position.set(3, 4, 5); scene.add(kl)
    const fl = new THREE.DirectionalLight(0xffffff, 0.5); fl.position.set(-3, 2, -4); scene.add(fl)

    // Cargar GLB
    const loader = new GLTFLoader()
    loader.load('/models/camiseta-camiart.glb', (gltf: any) => {
      const model = gltf.scene
      let baseTexture: any = null

      // Extraer textura base del material original
      model.traverse((child: any) => {
        if (child.isMesh && child.material && child.material.map) {
          baseTexture = child.material.map
        }
      })

      // Si no hay textura base, crear una de color sólido
      if (!baseTexture) {
        const c = document.createElement('canvas'); c.width = 64; c.height = 64
        const ctx = c.getContext('2d')!; ctx.fillStyle = shirtColor; ctx.fillRect(0, 0, 64, 64)
        baseTexture = new THREE.CanvasTexture(c)
      }

      // Crear textura del logo (canvas con diseño del usuario)
      const logoSrc = createLogoSrc(designImage, designText, fontSize)
      const logoTexture = new THREE.TextureLoader().load(logoSrc)
      logoTexture.colorSpace = THREE.SRGBColorSpace
      logoTexture.premultiplyAlpha = false

      // Crear material con shader personalizado
      const projMatrix = buildProjectorMatrix(THREE, PROJ_POS[position], PROJ_SCALE[position])

      const shaderMat = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uBaseTex: { value: baseTexture },
          uLogoTex: { value: logoTexture },
          uProjMatrix: { value: projMatrix },
        },
        side: THREE.DoubleSide,
      })
      materialRef.current = shaderMat

      // Aplicar a todas las mallas
      model.traverse((child: any) => {
        if (child.isMesh) child.material = shaderMat
      })

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
    })

    // Animación
    const animate = () => {
      animRef.current = requestAnimationFrame(animate)
      controls.update(); renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      const w = container.clientWidth; const h = container.clientHeight
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animRef.current)
      try { renderer.dispose() } catch {}
      scene.clear()
    }
  }, [modules, visible])

  // Actualizar logo/proyector cuando cambien props
  useEffect(() => {
    if (!materialRef.current || !modules || !visible) return
    const { THREE } = modules

    // Actualizar textura del logo
    const logoSrc = createLogoSrc(designImage, designText, fontSize)
    const loader = new THREE.TextureLoader()
    const newTex = loader.load(logoSrc)
    newTex.colorSpace = THREE.SRGBColorSpace
    newTex.premultiplyAlpha = false
    materialRef.current.uniforms.uLogoTex.value = newTex

    // Actualizar matriz del proyector (nueva posición)
    const newMatrix = buildProjectorMatrix(THREE, PROJ_POS[position], PROJ_SCALE[position])
    materialRef.current.uniforms.uProjMatrix.value = newMatrix
  }, [designImage, designText, fontSize, position, modules, visible])

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

// Generar data URL del logo (canvas con diseño + texto)
function createLogoSrc(img: string | null, text: string, fs: number): string {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 512, 512)

  if (img) {
    const i = new Image(); i.src = img
    if (i.complete && i.width > 0) {
      const asp = i.width / i.height; let dw = 400, dh = 400
      if (asp > 1) dh = 400 / asp; else dw = 400 * asp
      ctx.drawImage(i, (512 - dw) / 2, (512 - dh) / 2, dw, dh)
    }
  }
  if (text) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'
    ctx.font = `bold ${fs * 4}px Arial`
    const words = text.split(' '), lines: string[] = []; let cl = ''
    for (const w of words) { const t = cl + w + ' '; if (ctx.measureText(t).width > 380) { lines.push(cl.trim()); cl = w + ' ' } else cl = t }
    lines.push(cl.trim()); const lh = fs * 4 * 1.3
    lines.forEach((l, i) => ctx.fillText(l, 256, 256 - ((lines.length - 1) * lh) / 2 + i * lh))
  }
  return c.toDataURL('image/png')
}
