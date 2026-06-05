// =============================================================================
// Gor Factory — Módulo de Documentos (facturas, albaranes, pedidos, etc.)
// =============================================================================

import { GorFactoryClient } from './client';
import { GorDocFilter, GorApiResult } from './types';

export class GorDocumentsModule {
  constructor(private readonly client: GorFactoryClient) {}

  /**
   * Lista documentos según filtros.
   * POST /api/v1.0/doc/getall
   */
  async getAll(filter: GorDocFilter): Promise<GorApiResult<unknown[]>> {
    const fields: Record<string, string> = { doctype: filter.doctype };
    if (filter.datefrom) fields.datefrom = filter.datefrom;
    if (filter.dateto) fields.dateto = filter.dateto;
    if (filter.docnum) fields.docnum = filter.docnum;
    if (filter.numatcard) fields.numatcard = filter.numatcard;

    return this.client.postForm<unknown[]>('/api/v1.0/doc/getall', fields);
  }

  /**
   * Obtiene un documento específico.
   * POST /api/v1.0/doc/get
   */
  async get(doctype: string, docnum: string): Promise<GorApiResult<unknown>> {
    return this.client.postForm<unknown>('/api/v1.0/doc/get', {
      doctype,
      docnum,
    });
  }

  /**
   * Obtiene la representación imprimible de un documento.
   * POST /api/v1.0/doc/print
   */
  async print(
    doctype: string,
    docnum: string,
    lang = 'es-ES',
    format: 'xml' | 'json' = 'xml',
  ): Promise<GorApiResult<unknown>> {
    return this.client.postForm<unknown>('/api/v1.0/doc/print', {
      doctype,
      docnum,
      lang,
      format,
    });
  }
}
