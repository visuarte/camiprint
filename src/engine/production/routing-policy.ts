import 'server-only';

/**
 * Engine: Production Module — Routing Policy
 *
 * Determina a qué departamento se enruta un JobTicket según reglas de negocio.
 * Sin imports de next/*, react ni HTTP.
 */

import { type Department, type CreateTicketInput } from './types';

/**
 * Reglas de enrutamiento (orden de precedencia):
 * 1. Técnicas que requieren pre-tratamiento de arte → PREPRESS
 * 2. Alta cantidad o múltiples colores → PRINTING directo con prioridad
 * 3. Por defecto → PREPRESS (el flujo estándar siempre pasa por prepress)
 *
 * El departamento QA y SHIPPING son asignados por transición de estado posterior,
 * no en la creación inicial del ticket.
 */
export function routeTicketToDepartment(input: CreateTicketInput): Department {
  const technique = input.printTechnique.toUpperCase();

  // Técnicas digitales/complejas requieren revisión de arte antes de imprimir
  if (
    technique.includes('DTF') ||
    technique.includes('SUBLIMACION') ||
    technique.includes('SUBLIMACIÓN') ||
    technique.includes('BORDADO') ||
    technique.includes('TRANSFER')
  ) {
    return 'PREPRESS';
  }

  // Serigrafía con muchos colores va directo a PRINTING (configuración específica)
  if (technique.includes('SERIGRAFIA') || technique.includes('SERIGRAFÍA')) {
    if (input.colorCount >= 4) {
      return 'PRINTING';
    }
    return 'PREPRESS';
  }

  // Default: todos los tickets nuevos pasan por PREPRESS
  return 'PREPRESS';
}

/**
 * Devuelve la siguiente transición de departamento válida en el flujo estándar.
 * PREPRESS → PRINTING → QA → SHIPPING
 */
export function getNextDepartment(current: Department): Department | null {
  const flow: Department[] = ['PREPRESS', 'PRINTING', 'QA', 'SHIPPING'];
  const idx = flow.indexOf(current);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
}
