import 'server-only';

/**
 * Engine: Production Module — Validators
 *
 * Validaciones de negocio puras. Sin imports de next/*, react ni HTTP.
 */

import {
  ALLOWED_EXTENSIONS,
  MAX_ASSET_SIZE_BYTES,
  type AllowedExtension,
  type RegisterAssetInput,
  type CreateTicketInput,
} from './types';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function ok(): ValidationResult {
  return { ok: true, errors: [] };
}

function fail(...errors: string[]): ValidationResult {
  return { ok: false, errors };
}

/**
 * Valida que un nombre de archivo tenga extensión permitida (.pdf, .tif, .tiff).
 */
export function validateAssetExtension(filename: string): {
  ok: boolean;
  extension: AllowedExtension | null;
  error?: string;
} {
  const lower = filename.toLowerCase();
  const ext = ALLOWED_EXTENSIONS.find((e) => lower.endsWith(e));
  if (!ext) {
    return {
      ok: false,
      extension: null,
      error: `Extensión no permitida. Se aceptan: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }
  return { ok: true, extension: ext };
}

/**
 * Valida los datos de entrada para registrar un DesignAsset en el Engine.
 */
export function validateRegisterAssetInput(input: RegisterAssetInput): ValidationResult {
  const errors: string[] = [];

  if (!input.productionOrderId?.trim()) {
    errors.push('productionOrderId es obligatorio');
  }
  if (!input.originalFilename?.trim()) {
    errors.push('originalFilename es obligatorio');
  }
  if (input.sizeBytes <= 0) {
    errors.push('sizeBytes debe ser mayor que 0');
  }
  if (input.sizeBytes > MAX_ASSET_SIZE_BYTES) {
    errors.push(`Archivo supera el límite de ${MAX_ASSET_SIZE_BYTES / (1024 * 1024)}MB`);
  }
  if (!input.storageKey?.trim()) {
    errors.push('storageKey es obligatorio');
  }
  if (!input.checksumSha256?.trim() || !/^[a-f0-9]{64}$/.test(input.checksumSha256)) {
    errors.push('checksumSha256 debe ser un hash SHA-256 válido (64 caracteres hex)');
  }
  if (!input.uploadedBy?.trim()) {
    errors.push('uploadedBy es obligatorio');
  }

  return errors.length ? fail(...errors) : ok();
}

/**
 * Valida los datos de entrada para crear un JobTicket.
 */
export function validateCreateTicketInput(input: CreateTicketInput): ValidationResult {
  const errors: string[] = [];

  if (!input.productionOrderId?.trim()) {
    errors.push('productionOrderId es obligatorio');
  }
  if (!input.garmentType?.trim()) {
    errors.push('garmentType es obligatorio');
  }
  if (!input.printTechnique?.trim()) {
    errors.push('printTechnique es obligatorio');
  }
  if (!Number.isInteger(input.colorCount) || input.colorCount < 1 || input.colorCount > 12) {
    errors.push('colorCount debe ser un entero entre 1 y 12');
  }
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    errors.push('quantity debe ser un entero positivo');
  }
  if (!(input.dueDate instanceof Date) || isNaN(input.dueDate.getTime())) {
    errors.push('dueDate debe ser una fecha válida');
  } else if (input.dueDate < new Date()) {
    errors.push('dueDate no puede ser una fecha pasada');
  }

  return errors.length ? fail(...errors) : ok();
}
