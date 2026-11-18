import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiEnvelope,
  CurationPendingFilterParams,
  CurationPendingItem,
  DailySyncReq,
  DailySyncRes,
  ErpCatalogItemRes,
  ErpSearchOptions,
  ErpSuggestVariantsReq,
  ErpSuggestVariantsRes,
  IgnoreCurationProductRes
} from '../../types/erp/erp.interface';

/**
 * Serviço de integração com o catálogo ERP Atrio, sugestão de variações e fila de curadoria rápida.
 */
@Injectable({
  providedIn: 'root'
})
export class ErpProductsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/erp-products`;

  /**
   * Pesquisa itens no catálogo ERP Atrio por nome, código Id_Pro, EAN ou marca.
   */
  search(
    q: string,
    options: ErpSearchOptions = {}
  ): Observable<ApiEnvelope<ErpCatalogItemRes[]>> {
    let params = new HttpParams().set('q', q);

    if (options.supplierSlug) {
      params = params.set('supplierSlug', options.supplierSlug);
    }
    if (options.includeInactive !== undefined) {
      params = params.set('includeInactive', String(options.includeInactive));
    }
    if (options.excludeProductSlug) {
      params = params.set('excludeProductSlug', options.excludeProductSlug);
    }
    if (options.page !== undefined) {
      params = params.set('page', String(options.page));
    }
    if (options.size !== undefined) {
      params = params.set('size', String(options.size));
    }

    return this.http.get<ApiEnvelope<ErpCatalogItemRes[]>>(`${this.API_URL}/search`, { params });
  }

  /**
   * Consulta unitária de um item do ERP pelo código numérico Id_Pro.
   */
  getByErpCode(
    erpCode: number,
    excludeProductSlug?: string
  ): Observable<ApiEnvelope<ErpCatalogItemRes>> {
    let params = new HttpParams();
    if (excludeProductSlug) {
      params = params.set('excludeProductSlug', excludeProductSlug);
    }
    return this.http.get<ApiEnvelope<ErpCatalogItemRes>>(`${this.API_URL}/${erpCode}`, { params });
  }

  /**
   * Alias de consulta unitária por código ERP.
   */
  lookupByCode(
    erpCode: number,
    excludeProductSlug?: string
  ): Observable<ApiEnvelope<ErpCatalogItemRes>> {
    return this.getByErpCode(erpCode, excludeProductSlug);
  }

  /**
   * Solicita expansão determinística de sabores, apresentações e topologia para códigos selecionados em lote.
   */
  suggestVariants(req: ErpSuggestVariantsReq): Observable<ApiEnvelope<ErpSuggestVariantsRes>> {
    return this.http.post<ApiEnvelope<ErpSuggestVariantsRes>>(`${this.API_URL}/suggest-variants`, req);
  }

  /**
   * Alias para sugestão de variações em lote.
   */
  getSuggestions(req: ErpSuggestVariantsReq): Observable<ApiEnvelope<ErpSuggestVariantsRes>> {
    return this.suggestVariants(req);
  }

  /**
   * Lista produtos ativos pendentes de imagem na fila de Curadoria Rápida (ROLE_ADMIN / ROLE_USER).
   */
  getCurationPending(
    filters: CurationPendingFilterParams = {}
  ): Observable<ApiEnvelope<CurationPendingItem[]>> {
    let params = new HttpParams();
    if (filters.page !== undefined) {
      params = params.set('page', String(filters.page));
    }
    if (filters.size !== undefined) {
      params = params.set('size', String(filters.size));
    }
    if (filters.onlyFallback !== undefined) {
      params = params.set('onlyFallback', String(filters.onlyFallback));
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    return this.http.get<ApiEnvelope<CurationPendingItem[]>>(`${this.API_URL}/curation-pending`, { params });
  }

  /**
   * Alias para listagem da fila de Curadoria Rápida.
   */
  getPendingCuration(
    filters: CurationPendingFilterParams = {}
  ): Observable<ApiEnvelope<CurationPendingItem[]>> {
    return this.getCurationPending(filters);
  }

  /**
   * Descarta de forma auditável um produto pendente, ocultando da vitrine e bloqueando ressincronização futura.
   */
  ignorePending(
    slug: string,
    reason?: string
  ): Observable<ApiEnvelope<IgnoreCurationProductRes>> {
    const trimmedReason = reason?.trim();
    const body = trimmedReason ? { reason: trimmedReason } : {};
    return this.http.post<ApiEnvelope<IgnoreCurationProductRes>>(
      `${this.API_URL}/curation-pending/${slug}/ignore`,
      body
    );
  }

  /**
   * Alias para descarte auditável de produto pendente de curadoria.
   */
  ignorePendingProduct(
    slug: string,
    reason?: string
  ): Observable<ApiEnvelope<IgnoreCurationProductRes>> {
    return this.ignorePending(slug, reason);
  }

  /**
   * Dispara sincronização diária sob demanda (restrito a ROLE_ADMIN).
   */
  triggerDailySync(req: DailySyncReq = {}): Observable<ApiEnvelope<DailySyncRes>> {
    return this.http.post<ApiEnvelope<DailySyncRes>>(`${this.API_URL}/sync/daily`, req);
  }

  /**
   * Consulta o status / refresh do snapshot ERP Atrio em memória.
   */
  getSyncStatus(): Observable<ApiEnvelope<Record<string, unknown>>> {
    return this.http.post<ApiEnvelope<Record<string, unknown>>>(`${this.API_URL}/sync`, {});
  }
}
