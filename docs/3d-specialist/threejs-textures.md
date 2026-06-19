# Three.js Textures & Materials — Aplicar texturas desde canvas

## Cargar textura desde un data URL (canvas.toDataURL)

```javascript
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load(canvas.toDataURL('image/png'))

// Aplicar al material
material.map = texture
material.needsUpdate = true
```

## Aplicar textura a un modelo cargado con GLTFLoader

```javascript
loader.load('/modelo.glb', (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => { m.map = texture; m.needsUpdate = true })
      } else {
        child.material.map = texture
        child.material.needsUpdate = true
      }
    }
  })
})
```

## Propiedades importantes del material

- `map`: Textura de color (diffuse/albedo)
- `needsUpdate`: Debe ser `true` después de cambiar la textura
- `transparent`: `true` si la textura tiene transparencia (PNG)
- `alphaTest`: Umbral de transparencia (ej: 0.05 para recortar bordes)
- `side`: `THREE.DoubleSide` para ver desde ambos lados
- `depthWrite`: `false` para evitar z-fighting con transparencia
- `polygonOffset`, `polygonOffsetFactor`: Para evitar z-fighting

## Canvas como textura

```javascript
const canvas = document.createElement('canvas')
canvas.width = 512; canvas.height = 512
const ctx = canvas.getContext('2d')
// ... dibujar en el canvas ...
const texture = new THREE.CanvasTexture(canvas)
texture.needsUpdate = true
texture.premultiplyAlpha = false  // Importante para PNG con transparencia
```

## Ajuste de textura

- `texture.repeat.set(1, 1)`: Repetición de la textura
- `texture.offset.set(0, 0)`: Desplazamiento de la textura
- `texture.wrapS = THREE.RepeatWrapping`: Cómo se repite en horizontal
- `texture.wrapT = THREE.RepeatWrapping`: Cómo se repite en vertical
- `texture.rotation`: Rotación de la textura

## Problemas comunes

1. **La textura no se ve**: `material.needsUpdate = true` después de asignar
2. **La textura se ve negra**: El canvas no está bien inicializado (clearRect)
3. **La textura se ve estirada**: UVs del modelo no coinciden con la textura
4. **Transparencia no funciona**: Falta `transparent: true` en el material
5. **Z-fighting**: Usar `polygonOffset` en el material del decal
