import { prisma } from '@/server/db'
import { createGorFactory } from '@/server/integrations/gor-factory/factory'
import * as archiver from 'archiver'
import { Writable } from 'node:stream'
import { Readable } from 'node:stream'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { writeFile, mkdir, readFile, unlink } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'

export interface JobSheetResult {
  orderId: string
  jobSheetId: string
  blobUrl: string | null
  totalItems: number
  gtinPdfUrl?: string
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function generateJobSheetHtml(order: any, lines: any[], assets: any[], gtinLabel: string): string {
  const itemsHtml = lines.map((l: any, i: number) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">${i + 1}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd">${l.productName || l.productSku}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd">${l.productSku || '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">${l.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">${(l.unitPrice || 0).toFixed(2)}€</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">${((l.unitPrice || 0) * (l.quantity || 0)).toFixed(2)}€</td>
    </tr>`).join('')

  const assetsHtml = assets.map((a: any) =>
    `<li style="padding:4px 0">${a.filename} (${(a.size / 1024).toFixed(1)} KB)</li>`
  ).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>JobSheet #${order.id}</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#333;max-width:900px;margin:40px auto;padding:0 20px}
  h1{font-size:22px;color:#111;border-bottom:2px solid #ff4f00;padding-bottom:8px}
  h2{font-size:16px;color:#333;margin-top:24px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#f5f5f5;padding:8px;text-align:left;font-size:12px;text-transform:uppercase;border-bottom:2px solid #ddd}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}
  .meta-item{padding:8px 12px;background:#fafafa;border-radius:6px}
  .meta-item label{font-size:11px;text-transform:uppercase;color:#888;display:block}
  .meta-item span{font-size:14px;font-weight:600;color:#222}
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#888;text-align:center}
  .barcode{text-align:center;margin:20px 0;padding:16px;background:#fff;border:2px dashed #ccc;border-radius:8px}
  .barcode code{font-size:18px;letter-spacing:4px;font-weight:bold;color:#111}
</style></head>
<body>
  <h1>📋 JobSheet — Orden de Producción</h1>
  <p style="color:#666">Generado: ${formatDate(new Date())} | ID: ${order.id}</p>

  <div class="barcode">
    <code>${gtinLabel}</code>
    <p style="font-size:11px;color:#888;margin-top:6px">Código de lote / GTIN</p>
  </div>

  <h2>Datos del Pedido</h2>
  <div class="meta">
    <div class="meta-item"><label>Cliente</label><span>${order.customer?.name || order.email || '-'}</span></div>
    <div class="meta-item"><label>Email</label><span>${order.email || '-'}</span></div>
    <div class="meta-item"><label>Teléfono</label><span>${order.phone || '-'}</span></div>
    <div class="meta-item"><label>Dirección</label><span>${order.address || '-'}</span></div>
    <div class="meta-item"><label>Fecha pedido</label><span>${formatDate(new Date(order.createdAt))}</span></div>
    <div class="meta-item"><label>Estado</label><span style="color:#16a34a">${order.status}</span></div>
    <div class="meta-item"><label>Total</label><span>${(order.totalAmount || 0).toFixed(2)}€</span></div>
    <div class="meta-item"><label>Stripe ID</label><span style="font-size:11px">${order.stripePaymentIntentId || '-'}</span></div>
  </div>

  <h2>Líneas de Producción</h2>
  <table>
    <thead><tr>
      <th style="text-align:center">#</th><th>Producto</th><th>SKU</th>
      <th style="text-align:center">Cant.</th><th style="text-align:center">Precio</th><th style="text-align:center">Total</th>
    </tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <h2>Archivos de Impresión</h2>
  ${assetsHtml ? `<ul style="padding-left:20px">${assetsHtml}</ul>` : '<p style="color:#999">Sin archivos adjuntos</p>'}

  <div class="footer">
    <p>CamiArt — Camisetas personalizadas | ${formatDate(new Date())}</p>
    <p style="font-size:10px">JobSheet auto-generado · Revisar antes de producir</p>
  </div>
</body></html>`
}

export async function generateJobSheet(orderId: string): Promise<JobSheetResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      customer: true,
    },
  })

  if (!order) throw new Error(`Order ${orderId} not found`)

  const jobSheetId = `JS-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`
  const gtinLabel = `CAM${String(order.id).slice(-8).padStart(8, '0')}${String(Date.now()).slice(-4)}`

  const tmpDir = join(tmpdir(), `jobsheet-${jobSheetId}`)
  await mkdir(tmpDir, { recursive: true })

  // Build production lines from order items + GOR catalog lookup
  const lines: any[] = order.items.map((item: any) => ({
    productSku: item.productId || 'CUSTOM',
    productName: item.product?.name || `Producto #${item.productId}`,
    quantity: item.quantity,
    unitPrice: item.price,
  }))

  // Try to enrich with GOR catalog data
  try {
    const gor = createGorFactory()
    const catalogResult = await gor.catalog.getCatalog('roly')
    const catalog = catalogResult.success && catalogResult.data ? catalogResult.data : []
    lines.forEach((line) => {
      const match = (catalog as any[]).find((m: any) =>
        m.items?.some((i: any) => i.itemcode === line.productSku || i.description === line.productName)
      )
      if (match) {
        line.productName = match.modelname || line.productName
        line.productSku = match.modelcode || line.productSku
      }
    })
  } catch {
    // GOR sync is optional for jobsheet
  }

  // Collect design assets
  const assets = await prisma.designAsset.findMany({
    where: { productionOrder: { orderId } },
  }).catch(() => [] as any[])

  // Write jobsheet.json
  const jsonPayload = {
    jobSheetId,
    orderId: order.id,
    generatedAt: new Date().toISOString(),
    gtinLabel,
    customer: {
      name: order.customer?.name || order.email,
      email: order.email,
      phone: order.phone,
      address: order.address,
    },
    items: lines,
    totalAmount: order.totalAmount,
    status: order.status,
    designAssets: assets.map((a: any) => ({
      filename: a.filename,
      storageKey: a.storageKey,
      mimeType: a.mimeType,
      size: a.size,
    })),
  }
  await writeFile(join(tmpDir, 'jobsheet.json'), JSON.stringify(jsonPayload, null, 2), 'utf-8')

  // Write jobsheet.html
  const html = generateJobSheetHtml(order, lines, assets, gtinLabel)
  await writeFile(join(tmpDir, 'jobsheet.html'), html, 'utf-8')

  // Copy design asset files
  for (const asset of assets) {
    if (asset.storageKey) {
      try {
        const srcPath = join(process.cwd(), 'public', asset.storageKey)
        const destPath = join(tmpDir, 'designs', asset.filename)
        await mkdir(join(tmpDir, 'designs'), { recursive: true })
        const data = await readFile(srcPath)
        await writeFile(destPath, data)
      } catch {
        // file not available locally, skip
      }
    }
  }

  // Create zip archive
  const zipPath = join(tmpdir(), `${jobSheetId}.zip`)
  await new Promise<void>((resolve, reject) => {
    const output = require('fs').createWriteStream(zipPath)
    const archive = (archiver as any).default('zip', { zlib: { level: 9 } })
    archive.on('error', reject)
    archive.pipe(output)
    archive.directory(tmpDir, false)
    archive.finalize()
    output.on('close', resolve)
  })

  // Read zip into buffer
  const zipBuffer = await readFile(zipPath)

  // Upload to Vercel Blob
  let blobUrl: string | null = null
  try {
    const { put } = await import('@vercel/blob')
    const blob = await put(`jobsheets/${jobSheetId}.zip`, zipBuffer, {
      access: 'public',
      addRandomSuffix: false,
    })
    blobUrl = blob.url
  } catch {
    // Fallback: store locally
    const localPath = join(process.cwd(), 'public', 'jobsheets', `${jobSheetId}.zip`)
    await mkdir(join(process.cwd(), 'public', 'jobsheets'), { recursive: true })
    await writeFile(localPath, zipBuffer)
    blobUrl = `/jobsheets/${jobSheetId}.zip`
  }

  // Cleanup temp files
  await unlink(zipPath).catch(() => {})
  await unlink(join(tmpDir, 'jobsheet.json')).catch(() => {})
  await unlink(join(tmpDir, 'jobsheet.html')).catch(() => {})

  // Create DesignAsset and JobTicket records
  await prisma.designAsset.create({
    data: {
      productionOrderId: orderId,
      filename: `${jobSheetId}.zip`,
      storageKey: blobUrl || '',
      mimeType: 'application/zip',
      size: zipBuffer.length,
      checksumSha256: createHash('sha256').update(zipBuffer).digest('hex'),
    },
  }).catch(() => {})

  return {
    orderId: order.id,
    jobSheetId,
    blobUrl,
    totalItems: lines.reduce((sum: number, l: any) => sum + (l.quantity || 0), 0),
    gtinPdfUrl: blobUrl || undefined,
  }
}
