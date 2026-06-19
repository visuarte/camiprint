/**
 * Texture Baker — Aplica un diseño a la textura del modelo 3D de la camiseta
 * y genera un nuevo GLB texturizado.
 * 
 * Uso:
 *   node scripts/bake-texture.mjs <diseño.png> [posición] [color]
 * 
 * Ejemplo:
 *   node scripts/bake-texture.mjs uploads/diseno.png chest '#f5f5f0'
 */

import { Document, NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const MODEL_PATH = 'public/models/camiseta-camiart.glb';
const OUTPUT_DIR = 'public/models/textured';

const POSITION_LABELS = {
  chest: 'Pecho',
  back: 'Espalda',
  'sleeve-left': 'Manga izquierda',
  'sleeve-right': 'Manga derecha',
};

// Tamaño de la textura a generar (potencia de 2 para GPU)
const TEX_SIZE = 2048;

async function generateTexture(designPath, shirtColor) {
  // Crear imagen base con el color de la camiseta
  const base = sharp({
    create: {
      width: TEX_SIZE,
      height: TEX_SIZE,
      channels: 4,
      background: shirtColor,
    },
  }).png();

  if (designPath && fs.existsSync(designPath)) {
    // Redimensionar diseño para que ocupe ~40% de la textura (zona del pecho)
    const design = sharp(designPath);
    const meta = await design.metadata();
    const aspect = meta.width / meta.height;
    let dw = Math.round(TEX_SIZE * 0.4);
    let dh = Math.round(dw / (aspect || 1));
    if (dh > TEX_SIZE * 0.4) { dh = Math.round(TEX_SIZE * 0.4); dw = Math.round(dh * (aspect || 1)); }
    
    const resized = await design.resize(dw, dh, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    
    // Componer: fondo + diseño centrado
    const composite = await sharp({
      create: { width: TEX_SIZE, height: TEX_SIZE, channels: 4, background: shirtColor },
    })
      .composite([{
        input: resized,
        top: Math.round((TEX_SIZE - dh) / 2),
        left: Math.round((TEX_SIZE - dw) / 2),
      }])
      .png()
      .toBuffer();
    
    return composite;
  }

  return await base.toBuffer();
}

async function bake(designPath, position, shirtColor) {
  console.log(`🧵 Generando textura... color=${shirtColor} posición=${position}`);
  
  const texPng = await generateTexture(designPath, shirtColor);
  const texPath = path.join(OUTPUT_DIR, `texture_${Date.now()}.png`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(texPath, texPng);
  console.log(`  Textura generada: ${texPath} (${(texPng.length / 1024).toFixed(0)} KB)`);

  // Cargar modelo GLB
  console.log('  Cargando modelo GLB...');
  const io = new NodeIO();
  const doc = await io.read(MODEL_PATH);
  const root = doc.getRoot();

  // Crear textura en el documento GLB
  console.log('  Aplicando textura al material...');
  const tex = doc.createTexture(`diseno_${Date.now()}`);
  tex.setImage(fs.readFileSync(texPath));
  tex.setMimeType('image/png');

  // Asignar a todos los materiales
  for (const mat of root.listMaterials()) {
    mat.setBaseColorTexture(tex);
    mat.setMetallicRoughnessTexture(null); // quitar roughness antiguo
    console.log(`  Material actualizado: ${mat.getName()}`);
  }

  // Exportar GLB texturizado
  const outputName = `camiseta-texturizada-${Date.now()}.glb`;
  const outputPath = path.join(OUTPUT_DIR, outputName);
  await io.write(outputPath, doc);
  
  const stats = fs.statSync(outputPath);
  console.log(`\n✅ GLB texturizado: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
  
  return { outputPath, outputName, texPath };
}

// CLI
const designPath = process.argv[2];
const position = process.argv[3] || 'chest';
const shirtColor = process.argv[4] || '#f5f5f0';

bake(designPath, position, shirtColor).catch(console.error);
