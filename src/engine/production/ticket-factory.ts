import 'server-only';

/**
 * Engine: Production Module — Ticket Factory
 *
 * Genera JobTickets con numeración secuencial determinista.
 * Sin imports de next/*, react ni HTTP.
 */

import { type JobTicket, type CreateTicketInput, type Department } from './types';

/**
 * Formato del ticketNumber: JT-YYYY-NNNNNN (ej: JT-2026-000231)
 * El sequence debe ser provisto por el repositorio (contador persistente).
 */
export function buildTicketNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(6, '0');
  return `JT-${year}-${seq}`;
}

/**
 * Genera un JobTicket completo a partir del input validado.
 * El id y ticketNumber son inyectados externamente (id = crypto UUID, sequence = repo).
 */
export function createJobTicket(
  id: string,
  ticketNumber: number,
  input: CreateTicketInput,
  department: Department,
): JobTicket {
  const now = new Date();
  return {
    id,
    productionOrderId: input.productionOrderId,
    ticketNumber,
    garmentType: input.garmentType,
    printTechnique: input.printTechnique,
    colorCount: input.colorCount,
    quantity: input.quantity,
    dueDate: input.dueDate,
    notes: input.notes ?? '',
    status: 'OPEN',
    department,
    createdAt: now,
    updatedAt: now,
  };
}
