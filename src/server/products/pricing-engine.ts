import { prisma } from '@/server/db'

export interface PriceResult {
  costPrice: number
  printingCost: number
  marginMarkup: number
  publicPrice: number
  isOverridden: boolean
}

// Brand sanitization mapping — replaces GOR brand names with Camiart names
const BRAND_SANITIZE: Record<string, string> = {
  'roly': 'Camiart',
  'Roly': 'Camiart',
  'ROLY': 'CAMIART',
  'stamina': 'Camiart Pro',
  'Stamina': 'Camiart Pro',
  'STAMINA': 'CAMIART PRO',
  'gor factory': 'Camiart',
  'Gor Factory': 'Camiart',
  'GOR FACTORY': 'CAMIART',
  'Stampia': 'Camiart Print',
  'STAMPIA': 'CAMIART PRINT',
  'stampia': 'Camiart Print',
}

const NAME_SANITIZE_PATTERNS = [
  { from: /\bRoly\b\s*/gi, to: 'Camiart ' },
  { from: /\bAtomic\b\s*/gi, to: 'Premium ' },
  { from: /\bGor\s+Factory\b/gi, to: 'Camiart' },
  { from: /\bStampia\b/gi, to: 'Camiart Print' },
  { from: /\bstampia\b/gi, to: 'Camiart Print' },
]

export function sanitizeBrandName(name: string): string {
  let result = name
  for (const { from, to } of NAME_SANITIZE_PATTERNS) {
    result = result.replace(from, to)
  }
  for (const [search, replace] of Object.entries(BRAND_SANITIZE)) {
    result = result.replace(new RegExp(search, 'gi'), replace)
  }
  return result.trim()
}

export function sanitizeBrandField(value: string): string {
  return sanitizeBrandName(value)
}

export function sanitizeCatalogItem(item: any): any {
  const sanitized = { ...item }
  if (sanitized.modelname) sanitized.modelname = sanitizeBrandName(sanitized.modelname)
  if (sanitized.description) sanitized.description = sanitizeBrandName(sanitized.description)
  if (sanitized.brand) sanitized.brand = 'camiart'
  if (sanitized.composition) sanitized.composition = sanitized.composition
  if (sanitized.family) sanitized.family = sanitizeBrandName(sanitized.family)
  // Sanitize categories field (GOR API returns comma-separated categories)
  if (sanitized.categories) {
    sanitized.categories = sanitized.categories
      .split(',')
      .map((c: string) => sanitizeBrandName(c.trim()))
      .filter(Boolean)
      .join(',')
  }
  return sanitized
}

export async function getProductPricing(sku: string): Promise<PriceResult> {
  const pricing = await prisma.productPricing.findUnique({ where: { sku } })

  if (!pricing) {
    // Default pricing
    return {
      costPrice: 0,
      printingCost: 0,
      marginMarkup: 0.6,
      publicPrice: 0,
      isOverridden: false,
    }
  }

  // Calculate public price
  let publicPrice: number
  if (pricing.publicPrice != null) {
    // Manual override
    publicPrice = pricing.publicPrice
  } else if (pricing.fixedMargin != null) {
    // Fixed margin in euros
    publicPrice = pricing.costPrice + pricing.printingCost + pricing.fixedMargin
  } else {
    // Percentage margin
    publicPrice = (pricing.costPrice + pricing.printingCost) * (1 + pricing.marginMarkup)
  }

  return {
    costPrice: pricing.costPrice,
    printingCost: pricing.printingCost,
    marginMarkup: pricing.marginMarkup,
    publicPrice: Math.round(publicPrice * 100) / 100,
    isOverridden: pricing.publicPrice != null,
  }
}

export async function getOrCreatePricing(sku: string, defaultCostPrice: number = 0): Promise<PriceResult> {
  const existing = await prisma.productPricing.findUnique({ where: { sku } })

  if (!existing) {
    await prisma.productPricing.create({
      data: {
        sku,
        costPrice: defaultCostPrice,
        printingCost: 0,
        marginMarkup: 0.6,
      },
    })
  }

  return getProductPricing(sku)
}

export async function calculateOrderTotal(items: Array<{ sku: string; quantity: number }>): Promise<{
  total: number
  lineItems: Array<{ sku: string; quantity: number; unitPrice: number; total: number }>
}> {
  let total = 0
  const lineItems = []

  for (const item of items) {
    const pricing = await getProductPricing(item.sku)
    const lineTotal = pricing.publicPrice * item.quantity
    total += lineTotal
    lineItems.push({
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: pricing.publicPrice,
      total: lineTotal,
    })
  }

  return { total: Math.round(total * 100) / 100, lineItems }
}
