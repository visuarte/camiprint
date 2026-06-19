# UV Mapping Guide — Mapeo de texturas en modelos 3D

## ¿Qué son las UVs?

Las coordenadas UV son un sistema de coordenadas 2D que mapea una textura 2D sobre una superficie 3D.
- U = horizontal (eje X de la imagen)
- V = vertical (eje Y de la imagen, invertido respecto a la imagen)

## Rango de UVs

| Rango | Significado | Problema |
|-------|-------------|----------|
| 0.0 - 1.0 | Normal. La textura se estira para cubrir exactamente la malla | ✅ |
| > 1.0 o < 0.0 | Tiling. La textura se repite | ⚠️ Diseñado para telas/patrones |
| Múltiples islas UV | La malla tiene regiones separadas con diferentes UVs | ⚠️ Común en modelos complejos |
| Sin UVs | El modelo no tiene coordenadas UV | ❌ No se puede texturizar |

## Problema típico con modelos de ropa

Los modelos de camisetas/ropa suelen tener:
1. **UVs fuera de rango 0-1**: Los valores como 1.3, 2.1, -0.5 son comunes porque el modelo fue diseñado para texturas de tela que se repiten (seamless).
2. **Múltiples meshes**: Frente, espalda, mangas izquierda/derecha como meshes separados.
3. **UVs inconsistentes entre meshes**: Cada mesh puede tener su propio layout UV.

**Consecuencia**: Al aplicar una textura con un diseño centrado (un logo), el motor 3D no sabe dónde colocarlo porque las UVs están pensadas para repetir un patrón de tela, no para mostrar un diseño único.

## Soluciones según el contexto

### Si PUEDES modificar el modelo (Blender, Maya)

1. **Normalizar UVs**: Escalar todas las islas UV para que quepan en 0-1
2. **Unificar meshes**: Combinar frente, espalda y mangas en un solo mesh
3. **Crear un UV layout limpio**: El frente debe ocupar ~50% del espacio UV, la espalda ~40%, mangas ~10%
4. **Exportar como GLB** con `+Y up`, texturas incrustadas (embed)

### Si NO PUEDES modificar el modelo (solo tienes el GLB)

1. **Usar gltf-transform** para inspeccionar y modificar las UVs programáticamente
2. **Usar servidor Python** (Open3D) para re-mapear las UVs
3. **Aceptar la limitación** y usar vista 2D con CSS 3D transforms (sin modelo 3D real)

### Con gltf-transform (Node.js)

```javascript
const { NodeIO } = require('@gltf-transform/core')
const io = new NodeIO()
const doc = await io.read('modelo.glb')
// El re-mapeo UV requiere acceso a los primitivos
// gltf-transform no expone directamente los arrays de UVs para modificación
// Para eso necesitas acceder al buffer subyacente
```

### Con trimesh (Python, offline)

```python
import trimesh
import numpy as np

mesh = trimesh.load('modelo.glb')
# Ver UVs
if hasattr(mesh.visual, 'uv'):
    uv = mesh.visual.uv
    print(f"UV range: [{uv.min():.3f}, {uv.max():.3f}]")
    # Normalizar a 0-1
    uv_normalized = (uv - uv.min()) / (uv.max() - uv.min())
    mesh.visual.uv = uv_normalized
    mesh.export('modelo_normalizado.glb')
```

## Cómo detectar el problema

```bash
# Con Node.js
node -e "
const { NodeIO } = require('@gltf-transform/core');
const io = new NodeIO();
io.read('modelo.glb').then(doc => {
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const uv = prim.getAttribute('TEXCOORD_0');
      if (uv) {
        const arr = uv.getArray();
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] < min) min = arr[i];
          if (arr[i] > max) max = arr[i];
        }
        console.log(mesh.getName(), 'UV range:', min.toFixed(3), '-', max.toFixed(3));
      }
    }
  }
});
"
```

## Alternativas sin modelo 3D real

Si el modelo GLB no se puede arreglar, estas alternativas funcionan:

1. **CSS 3D transforms** sobre canvas 2D → simula rotación 3D con `perspective: 800px` + `rotateY()`
2. **Generar múltiples vistas 2D** desde Blender (render front, 3/4, back) y mostrarlas como carrusel
3. **Usar un servicio externo** (Sketchfab, Vectary) para el hosting 3D con su propio render engine
