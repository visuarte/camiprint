"""
UV Mapper — Extrae el UV layout del modelo 3D de la camiseta
y genera plantillas 2D para superponer diseños.

Uso:
  python scripts/uv-mapper.py                          # generar plantillas
  python scripts/uv-mapper.py --preview diseño.png      # previsualizar diseño en la camiseta

Requiere: trimesh, Pillow, numpy
"""

import sys, os, json, io
import numpy as np
from PIL import Image, ImageDraw

try:
    import trimesh
except ImportError:
    print("Instala trimesh: pip install trimesh Pillow numpy")
    sys.exit(1)

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'camiseta-camiart.glb')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'uv-templates')

def ensure_output_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_model(path=None):
    path = path or MODEL_PATH
    if not os.path.exists(path):
        print(f"Modelo no encontrado: {path}")
        # Buscar cualquier .glb en public/models/
        models_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'models')
        if os.path.exists(models_dir):
            glbs = [f for f in os.listdir(models_dir) if f.endswith('.glb')]
            if glbs:
                path = os.path.join(models_dir, glbs[0])
                print(f"Usando: {path}")
    mesh = trimesh.load(path)
    print(f"Modelo cargado: {path}")
    print(f"  Geometrías: {len(mesh.geometry) if hasattr(mesh, 'geometry') else 1}")
    return mesh

def extract_uv_info(mesh):
    """Extrae información de UV del modelo."""
    results = []

    if hasattr(mesh, 'geometry'):
        geometries = mesh.geometry
    else:
        geometries = {'root': mesh}

    for name, geom in geometries.items():
        if hasattr(geom, 'visual') and hasattr(geom.visual, 'uv'):
            uv = geom.visual.uv
            if uv is not None and len(uv) > 0:
                vertices = geom.vertices
                faces = geom.faces
                print(f"  [{name}] {len(faces)} caras, {len(vertices)} vértices, UVs: {len(uv)}")
                results.append({
                    'name': name,
                    'uv': uv,
                    'faces': faces,
                    'vertices': vertices,
                })

    return results

def render_uv_template(uv_data, output_path, size=1024):
    """Renderiza el UV layout como imagen PNG."""
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    for data in uv_data:
        uv = data['uv']
        faces = data['faces']
        vertices_3d = data['vertices']

        for face in faces:
            # Mapear vértices 3D a UV
            uv_coords = []
            for vi in face:
                if vi < len(uv):
                    u, v = uv[vi]
                    x = int(u * size)
                    y = int((1 - v) * size)  # invertir Y
                    uv_coords.append((x, y))

            if len(uv_coords) == 3:
                draw.polygon(uv_coords, outline=(100, 100, 100, 80), fill=(200, 200, 200, 30))

    img.save(output_path)
    print(f"  UV template guardada: {output_path}")
    return img

def generate_front_back_templates(mesh, output_prefix='camiseta'):
    """Genera plantillas frontal y trasera basadas en normales."""
    ensure_output_dir()

    if hasattr(mesh, 'geometry'):
        geometries = mesh.geometry
    else:
        geometries = {'root': mesh}

    all_vertices = []
    all_faces = []
    all_uvs = []

    for name, geom in geometries.items():
        if hasattr(geom, 'visual') and hasattr(geom.visual, 'uv'):
            uv = geom.visual.uv
            if uv is not None and len(uv) > 0:
                # Transformar vértices a coordenadas UV
                vertices_3d = geom.vertices
                # Proyectar a 2D (vista frontal = ignorar Z, vista lateral = ignorar X)
                for face in geom.faces:
                    if all(vi < len(uv) for vi in face):
                        all_faces.append(face + len(all_vertices))
                        for vi in face:
                            if vi >= len(all_uvs):
                                u, v = uv[vi]
                                all_uvs.append((float(u), float(v)))

    if not all_uvs:
        print("  No se encontraron UVs. Usando proyección planar...")
        return generate_planar_templates(mesh, output_prefix)

    # Renderizar UV completo
    uv_array = np.array(all_uvs)
    render_uv([(uv_array, np.array(all_faces))], os.path.join(OUTPUT_DIR, f'{output_prefix}_uv_template.png'))

    # Generar silueta frontal (proyección Z)
    generate_silhouette(mesh, output_prefix)

def generate_planar_templates(mesh, output_prefix):
    """Fallback: genera plantillas por proyección planar cuando no hay UVs."""
    from mpl_toolkits.mplot3d import Axes3D
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt

    ensure_output_dir()
    size = 1024

    if hasattr(mesh, 'geometry'):
        geometries = mesh.geometry
    else:
        geometries = {'root': mesh}

    for name, geom in geometries.items():
        if hasattr(geom, 'vertices') and hasattr(geom, 'faces'):
            verts = geom.vertices
            faces = geom.faces

            # Proyección frontal (X, Y)
            fig, ax = plt.subplots(1, 1, figsize=(8, 10))
            for face in faces:
                polygon = [(verts[vi][0], verts[vi][1]) for vi in face]
                poly = plt.Polygon(polygon, fill=True, facecolor='#e0e0e0', edgecolor='#666666', linewidth=0.3, alpha=0.5)
                ax.add_patch(poly)
            ax.set_aspect('equal')
            ax.axis('off')
            ax.set_xlim(verts[:, 0].min(), verts[:, 0].max())
            ax.set_ylim(verts[:, 1].min(), verts[:, 1].max())
            front_path = os.path.join(OUTPUT_DIR, f'{output_prefix}_front.png')
            fig.savefig(front_path, dpi=150, bbox_inches='tight', transparent=True, pad_inches=0)
            plt.close()
            print(f"  Plantilla frontal: {front_path}")

            # Proyección lateral (Z, Y)
            fig, ax = plt.subplots(1, 1, figsize=(8, 10))
            for face in faces:
                polygon = [(verts[vi][2], verts[vi][1]) for vi in face]
                poly = plt.Polygon(polygon, fill=True, facecolor='#e0e0e0', edgecolor='#666666', linewidth=0.3, alpha=0.5)
                ax.add_patch(poly)
            ax.set_aspect('equal')
            ax.axis('off')
            ax.set_xlim(verts[:, 2].min(), verts[:, 2].max())
            ax.set_ylim(verts[:, 1].min(), verts[:, 1].max())
            side_path = os.path.join(OUTPUT_DIR, f'{output_prefix}_side.png')
            fig.savefig(side_path, dpi=150, bbox_inches='tight', transparent=True, pad_inches=0)
            plt.close()
            print(f"  Plantilla lateral: {side_path}")

    print("\n✅ Plantillas generadas en:", OUTPUT_DIR)

def render_uv(uv_data_list, output_path, size=2048):
    """Renderiza UV layout a PNG de alta resolución."""
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    for uv_array, faces in uv_data_list:
        for face in faces:
            coords = []
            for vi in face:
                if vi < len(uv_array):
                    u, v = uv_array[vi]
                    x = int(u * size)
                    y = int((1 - v) * size)
                    coords.append((x, y))
            if len(coords) == 3:
                draw.polygon(coords, outline=(80, 80, 80, 120), fill=(200, 200, 200, 25))

    img.save(output_path, optimize=True)
    print(f"  UV layout: {output_path}")

def generate_silhouette(mesh, output_prefix):
    """Genera silueta frontal desde proyección 2D."""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt

    if hasattr(mesh, 'geometry'):
        geometries = mesh.geometry
    else:
        geometries = {'root': mesh}

    all_verts = []
    all_faces = []

    for name, geom in geometries.items():
        if hasattr(geom, 'vertices') and hasattr(geom, 'faces'):
            offset = len(all_verts)
            all_verts.extend(geom.vertices.tolist())
            all_faces.extend((geom.faces + offset).tolist())

    verts = np.array(all_verts)
    faces = np.array(all_faces)

    if len(verts) == 0:
        print("  No hay vértices para generar silueta")
        return

    # Silueta frontal
    fig, ax = plt.subplots(1, 1, figsize=(6, 10))
    for face in faces:
        poly = plt.Polygon(verts[face][:, [0, 1]], fill=True,
                          facecolor='#f0f0f0', edgecolor='#999999',
                          linewidth=0.5, alpha=0.6)
        ax.add_patch(poly)
    ax.set_aspect('equal')
    ax.axis('off')
    margin = 5
    ax.set_xlim(verts[:, 0].min() - margin, verts[:, 0].max() + margin)
    ax.set_ylim(verts[:, 1].min() - margin, verts[:, 1].max() + margin)
    front_path = os.path.join(OUTPUT_DIR, f'{output_prefix}_front.png')
    fig.savefig(front_path, dpi=150, bbox_inches='tight', transparent=True, pad_inches=0)
    plt.close()
    print(f"  Silueta frontal: {front_path}")

    # Guardar metadatos del modelo
    meta = {
        'vertices': len(verts),
        'faces': len(faces),
        'bounds': {
            'x': [float(verts[:, 0].min()), float(verts[:, 0].max())],
            'y': [float(verts[:, 1].min()), float(verts[:, 1].max())],
            'z': [float(verts[:, 2].min()), float(verts[:, 2].max())],
        },
    }
    meta_path = os.path.join(OUTPUT_DIR, f'{output_prefix}_meta.json')
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)
    print(f"  Metadatos: {meta_path}")

def overlay_design(design_path, output_path, template='front', scale=0.6):
    """Superpone un diseño PNG sobre la plantilla de la camiseta."""
    template_map = {
        'front': os.path.join(OUTPUT_DIR, 'camiseta_front.png'),
        'side': os.path.join(OUTPUT_DIR, 'camiseta_side.png'),
        'uv': os.path.join(OUTPUT_DIR, 'camiseta_uv_template.png'),
    }

    template_path = template_map.get(template, template_map['front'])
    if not os.path.exists(template_path):
        print(f"Plantilla no encontrada: {template_path}")
        print("Ejecuta primero: python scripts/uv-mapper.py")
        return

    # Cargar plantilla y diseño
    template_img = Image.open(template_path).convert('RGBA')
    design = Image.open(design_path).convert('RGBA')

    # Redimensionar diseño al tamaño de la zona de estampado
    tw, th = template_img.size
    design_size = min(tw, th) * scale
    aspect = design.width / design.height
    dw = int(design_size)
    dh = int(design_size / aspect if aspect > 1 else design_size * aspect)
    design_resized = design.resize((dw, dh), Image.LANCZOS)

    # Centrar en el pecho (aproximadamente 50% ancho, 45% alto)
    pos_x = (tw - dw) // 2
    pos_y = int(th * 0.35)

    # Componer
    result = template_img.copy()
    result.paste(design_resized, (pos_x, pos_y), design_resized)
    result.save(output_path)
    print(f"Preview guardada: {output_path}")

if __name__ == '__main__':
    if '--preview' in sys.argv:
        idx = sys.argv.index('--preview')
        design_path = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else None
        if design_path and os.path.exists(design_path):
            ensure_output_dir()
            # Primero asegurar que existen las plantillas
            if not os.path.exists(os.path.join(OUTPUT_DIR, 'camiseta_front.png')):
                mesh = load_model()
                generate_front_back_templates(mesh)
            overlay_design(design_path, os.path.join(OUTPUT_DIR, 'preview.png'))
            print(f"\n✅ Vista previa: {os.path.join(OUTPUT_DIR, 'preview.png')}")
        else:
            print(f"Archivo no encontrado: {design_path}")
    else:
        # Generar plantillas
        ensure_output_dir()
        mesh = load_model()
        uv_info = extract_uv_info(mesh)
        if uv_info:
            print(f"\nProcesando {len(uv_info)} geometrías con UVs...")
        generate_front_back_templates(mesh)
        print(f"\n✅ Plantillas generadas en: {OUTPUT_DIR}")
        print(f"   frontal: camiseta_front.png")
        print(f"   UV layout: camiseta_uv_template.png")
        print(f"   metadatos: camiseta_meta.json")
        print(f"\nPara previsualizar un diseño:")
        print(f"   python scripts/uv-mapper.py --preview ruta/del/diseno.png")
