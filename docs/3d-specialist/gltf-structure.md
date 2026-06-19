# GLTF/GLB Structure — Referencia rápida

## ¿Qué es GLB?

GLB es el formato binario de GLTF (GL Transmission Format). Contiene toda la escena 3D en un solo archivo: mallas, materiales, texturas, animaciones.

## Estructura típica de un GLB cargado con GLTFLoader

```
gltf.scene  (Group)
  ├── child  (Mesh | Group)
  │     ├── geometry  (BufferGeometry)
  │     │     ├── attributes.position  (Float32Array)  → vértices 3D
  │     │     ├── attributes.normal    (Float32Array)  → normales
  │     │     └── attributes.uv        (Float32Array)  → coordenadas UV (opcional)
  │     ├── material  (MeshStandardMaterial | MeshPhysicalMaterial)
  │     │     ├── map          → textura base (color)
  │     │     ├── normalMap    → mapa de normales
  │     │     ├── roughnessMap → mapa de rugosidad
  │     │     ├── metalnessMap → mapa de metalicidad
  │     │     └── color        → color base (si no hay map)
  │     └── castShadow / receiveShadow
  └── ...
```

## Cómo inspeccionar un GLB con Node.js (gltf-transform)

```javascript
const { NodeIO } = require('@gltf-transform/core')
const io = new NodeIO()
const doc = await io.read('modelo.glb')
const root = doc.getRoot()

// Listar meshes
for (const mesh of root.listMeshes()) {
  console.log('Mesh:', mesh.getName())
  for (const prim of mesh.listPrimitives()) {
    const uvAttr = prim.getAttribute('TEXCOORD_0')
    if (uvAttr) {
      const arr = uvAttr.getArray()
      console.log('  UVs:', arr.length, 'valores')
      // Valores de ejemplo
      for (let i = 0; i < 6; i += 2) console.log(`  (${arr[i]}, ${arr[i+1]})`)
    }
    console.log('  Material:', prim.getMaterial()?.getName())
  }
}

// Listar materiales
for (const mat of root.listMaterials()) {
  console.log('Material:', mat.getName())
  console.log('  BaseColor:', mat.getBaseColorTexture()?.getName())
  console.log('  Color:', mat.getBaseColorFactor())
}
```

## Cómo inspeccionar con Python (pygltflib)

```python
import pygltflib
glb = pygltflib.GLTF2().load('modelo.glb')
for i, mesh in enumerate(glb.meshes):
    print(f"Mesh {i}: {mesh.name}")
    for j, prim in enumerate(mesh.primitives):
        print(f"  Primitive {j}: material={prim.material}")
        if prim.attributes.TEXCOORD_0 is not None:
            print(f"    Tiene UVs (accessor {prim.attributes.TEXCOORD_0})")
```

## Coordenadas UV

- Las UVs son arrays de 2 floats por vértice (U, V)
- Rango normal: 0.0 a 1.0 (textura se estira para cubrir la malla)
- Fuera de rango: >1.0 o <0.0 → la textura se repite (tiling)
- Valores negativos: común en modelos de tela (wrap around, mirror)
- UVs inconsistentes: diferentes meshes pueden tener diferentes UVs

## Materiales PBR (Physically Based Rendering)

- `MeshStandardMaterial`: Básico, soporta map, normalMap, roughness, metalness
- `MeshPhysicalMaterial`: Avanzado, soporta clearcoat, sheen, transmission
- Para camisetas: `MeshStandardMaterial` con `roughness: 0.6-0.8`, `metalness: 0`

## Texturas comunes en un modelo GLB

| Propiedad | Textura | Efecto |
|-----------|---------|--------|
| baseColor | map | Color de la tela |
| normal | normalMap | Relieve, arrugas |
| roughness | roughnessMap | Cuánto brilla |
| metalness | metalnessMap | Cuánto parece metal |
| occlusion | aoMap | Sombras ambientales |
