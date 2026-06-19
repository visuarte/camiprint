import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const designFile = formData.get('design') as File | null;
    const shirtColor = (formData.get('color') as string) || '#f5f5f0';
    const position = (formData.get('position') as string) || 'chest';

    // Guardar diseño en temp
    const tmpDir = join(tmpdir(), `bake-${randomUUID()}`);
    await mkdir(tmpDir, { recursive: true });

    let designPath = '';
    if (designFile) {
      designPath = join(tmpDir, 'design.png');
      const buffer = Buffer.from(await designFile.arrayBuffer());
      await writeFile(designPath, buffer);
    }

    // Ejecutar bake
    const scriptPath = join(process.cwd(), 'scripts', 'bake-texture.mjs');
    const cmd = `node "${scriptPath}" "${designPath}" "${position}" "${shirtColor}"`;
    
    let output;
    try {
      output = execSync(cmd, { timeout: 30000, cwd: process.cwd() }).toString();
    } catch (execErr) {
      const stderr = execErr.stderr?.toString() || '';
      return NextResponse.json({ ok: false, error: 'Bake failed', details: stderr }, { status: 500 });
    }

    // Extraer nombre del archivo generado del output
    const match = output.match(/camiseta-texturizada-\d+\.glb/);
    if (!match) {
      return NextResponse.json({ ok: false, error: 'No GLB generated', log: output }, { status: 500 });
    }

    const glbUrl = `/models/textured/${match[0]}`;

    return NextResponse.json({
      ok: true,
      glbUrl,
      log: output,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
