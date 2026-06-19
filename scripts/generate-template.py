"""Genera plantilla 2D de camiseta para superponer diseños."""
import json, os
from PIL import Image, ImageDraw

out = os.path.join('public', 'uv-templates')
os.makedirs(out, exist_ok=True)

size = 800
img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

pts = [
    (0.35, 0.02), (0.65, 0.02),  # cuello
    (0.92, 0.10), (0.85, 0.30),  # hombro der, axila der
    (0.88, 0.70), (0.90, 0.95),  # costado der, base der
    (0.10, 0.95), (0.12, 0.70),  # base izq, costado izq
    (0.15, 0.30), (0.08, 0.10),  # axila izq, hombro izq
]

poly = [(int(x * size), int(y * size)) for x, y in pts]
draw.polygon(poly, fill=(240, 240, 240, 200), outline=(150, 150, 150, 255))

# Cuello en V
cv = [(int(0.42 * size), int(0.04 * size)),
      (int(0.50 * size), int(0.12 * size)),
      (int(0.58 * size), int(0.04 * size))]
draw.polygon(cv, fill=(255, 255, 255, 220), outline=(150, 150, 150, 200))

# Zona de estampado
ex, ey, ew, eh = int(size * 0.25), int(size * 0.25), int(size * 0.50), int(size * 0.35)
draw.rectangle([ex, ey, ex + ew, ey + eh], outline=(200, 100, 50, 180), width=2)

front_path = os.path.join(out, 'camiseta_front.png')
img.save(front_path)
print(f'Plantilla guardada: {front_path}')

meta = {
    'width_px': size, 'height_px': size,
    'stamp_zone': {'x': 0.25, 'y': 0.25, 'w': 0.50, 'h': 0.35},
    'modelo': 'camiseta-camiart.glb',
}
with open(os.path.join(out, 'camiseta_meta.json'), 'w') as f:
    json.dump(meta, f, indent=2)

print(f'Metadatos guardados')
print(f'\nPara previsualizar un diseño: python scripts/uv-mapper.py --preview diseno.png')
