// =============================================================================
// Gor Factory API — Tipos e interfaces
// Basado en la respuesta real de DEV (verificada el 2026-06-05)
// =============================================================================

export type GorBrand = 'roly' | 'stamina' | 'roly_stamina';
export type GorEnvironment = 'dev' | 'pro';

export interface GorCredentials {
  username: string;
  password: string;
}

export interface GorConfig {
  environment: GorEnvironment;
  credentials: GorCredentials;
}

export interface GorAuthResponse {
  token: string;
}

// ---- ITEMS / CATÁLOGO ----
// Respuesta real de GET /api/v1.0/item/getcatalog

export interface GorCatalogRawItem {
  itemcode: string;
  itemname: string;
  eancode: string;
  measures: string; // ej: "[50cm/69cm]"
  modelcode: string;
  modelid: string;
  modelname: string;
  description: string;
  composition: string;
  observations: string;
  moq: string; // "1"
  packunits: string; // "1"
  boxunits: string; // "50"
  familycode: string; // ej: "CA"
  family: string; // ej: "CAMISETAS"
  gendercode: string; // ej: "MU", "UN", "CA"
  gender: string; // ej: "Mujer", "Unisex", "Caballero"
  sizecode: string; // ej: "04", "Z42"
  sizename: string; // ej: "XL", "42"
  colorcode: string; // ej: "806", "02223"
  colorname: string; // ej: "VERDE PATO LAVADO"
  collections: string;
  productimage: string; // URL
  modelimage: string; // URL
  childimage?: string; // URL
  detailsimages: string; // URLs separadas por comas
  viewsimages: string; // URLs separadas por comas
  otherimages: string;
  isforchildren: string; // "True" | "False"
  isnovelty: string; // "True" | "False"
  packincr: string; // "5.00"
  unitsincr: string; // "5.00"
  boxsize: string; // ej: "34.00 cm x 56.00 cm x 18.00 cm"
  weight: string; // ej: "8.40 kg"
  taric: string; // ej: "61091000"
  madein: string; // ej: "Bangladesh"
  canondigital: string; // "0.00"
  brand: string; // "roly"
  originalbrand: string;
  categories: string; // "Camisetas manga corta,Camisetas,Camisetas y polos,Roly"
  categoriesids: string; // "cam,t_shirts,cam_po,roly"
  categorytree: string;
  [key: string]: unknown;
}

export interface GorCatalogItem {
  itemcode: string;
  itemname: string;
  eancode: string;
  modelcode: string;
  modelname: string;
  description: string;
  composition: string;
  brand: GorBrand;
  family: string;
  gender: string;
  sizename: string;
  colorname: string;
  productimage: string;
  modelimage: string;
  detailsimages: string[];
  viewsimages: string[];
  moq: number;
  boxunits: number;
  weight: string;
  madein: string;
  categories: string[];
}

export interface GorCategory {
  id: string;
  name: string;
  parentId?: string;
  children?: GorCategory[];
}

export interface GorPriceListFilter {
  brand?: GorBrand;
  category?: string;
  model?: string;
  color?: string;
  size?: string;
  includeoutlet?: boolean;
}

export interface GorPriceListItem {
  itemcode: string;
  price: number;
  [key: string]: unknown;
}

// ---- STOCK ----
// Respuesta real de POST /api/v1.0/stock/getuserstock

export interface GorStockFilter {
  whscode: string;
  brand: GorBrand;
}

export interface GorStockRawItem {
  sku: string;
  description: string;
  onhand: number;
  incoming: string; // fecha "yyyy-MM-dd" o vacío
  state: string; // "SHIPPED", "PRODUCTIONS", vacío, etc.
  canteco: number; // cantidad en pedido
  brand: string;
  [key: string]: unknown;
}

export interface GorStockItem {
  sku: string;
  description: string;
  onhand: number;
  incoming: string | null;
  state: string;
  pendingSupply: number;
  brand: GorBrand;
}

export interface GorConsignmentUpdate {
  date: string; // "yyyy-MM-dd HH:mm:ss"
  stock: Array<{
    warehouse: string;
    sku: string;
    onhand: number;
  }>;
}

// ---- ORDER ----

export interface GorOrderLine {
  itemcode: string;
  quantity: string;
  warehouse: string;
}

export interface GorDeliveryAddress {
  addressname: string;
  address: string;
  city: string;
  postcode: string;
  state: string;
  country: string;
}

export interface GorOrderPayload {
  deliveryaddress: GorDeliveryAddress;
  reference: string;
  comments: string;
  lines: GorOrderLine[];
}

// ---- DOCUMENTS ----

export type GorDocType = 'invoice' | 'order' | 'deliverynote' | 'payment' | 'expiration' | '347report' | 'tracking';

export interface GorDocFilter {
  doctype: GorDocType;
  datefrom?: string; // yyyy-MM-dd
  dateto?: string;   // yyyy-MM-dd
  docnum?: string;
  numatcard?: string;
}

// ---- RESPUESTAS GENÉRICAS ----

export interface GorApiError {
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface GorApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  raw?: unknown;
}
