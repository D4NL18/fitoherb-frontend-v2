import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { ProductRes } from '../../types/products/productRes.interface';
import { PageResponse } from '../../types/page-response.interface';
import { ProductReq } from '../../types/products/ProductReq.interface';
import {
  ErpMappingStatus,
  ProductAdminRes,
  ProductCurationStatus
} from '../../types/products/ProductAdminRes.interface';

/**
 * Serviço HTTP para catálogo público (/products/gallery) e gestão administrativa Multi-SKU (/products).
 */
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/products`;

  private productGalleryState = signal<PageResponse<ProductRes>>({
    content: [], totalPages: 0, totalElements: 0, size: 0, number: 0, first: false, last: false, empty: true,
  });
  public productGallery = this.productGalleryState.asReadonly();

  private adminProductsState = signal<PageResponse<ProductAdminRes> | null>(null);
  public adminProducts = this.adminProductsState.asReadonly();

  private isAdminProductsLoadingState = signal<boolean>(false);
  public isAdminProductsLoading = this.isAdminProductsLoadingState.asReadonly();

  private isGalleryLoadingState = signal<boolean>(false);
  public isGalleryLoading = this.isGalleryLoadingState.asReadonly();

  getGallery(params: Record<string, unknown>, append: boolean = false, onSuccess?: () => void) {
    const httpParams = this.buildHttpParams(params);

    this.isGalleryLoadingState.set(true);

    this.http.get<PageResponse<ProductRes>>(`${this.API_URL}/gallery`, { params: httpParams })
      .subscribe({
        next: (res) => {
          if (append) {
            this.productGalleryState.update((prev) => ({
              ...res,
              content: [...prev.content, ...res.content],
            }));
          } else {
            this.productGalleryState.set(res);
          }
          this.isGalleryLoadingState.set(false);
          if (onSuccess) onSuccess();
        },
        error: () => {
          this.isGalleryLoadingState.set(false);
        }
      });
  }

  /**
   * Lista produtos paginados no painel administrativo, com filtros de categoria, fornecedor, status ERP e curadoria.
   */
  getPaginated(
    search: string = '',
    page: number = 0,
    sortField: string = 'name',
    direction: string = 'ASC',
    categories: string[] = [],
    suppliers: string[] = [],
    erpStatuses: ErpMappingStatus[] = [],
    active?: boolean | null,
    curationStatuses: ProductCurationStatus[] = []
  ) {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('sortField', sortField)
      .set('direction', direction);

    categories.forEach(c => { params = params.append('category', c); });
    suppliers.forEach(s => { params = params.append('supplier', s); });
    erpStatuses.forEach(status => { params = params.append('erpStatus', status); });
    if (active !== undefined && active !== null) {
      params = params.set('active', String(active));
    }
    curationStatuses.forEach(cs => { params = params.append('curationStatus', cs); });

    this.isAdminProductsLoadingState.set(true);
    this.http.get<PageResponse<ProductAdminRes>>(this.API_URL, { params }).pipe(
      finalize(() => this.isAdminProductsLoadingState.set(false))
    ).subscribe({
      next: (res) => this.adminProductsState.set(res),
      error: (err) => console.error('Erro ao carregar produtos (admin)', err)
    });
  }

  getProductsBySupplier(supplierSlug: string): Observable<PageResponse<ProductRes>> {
    const params = new HttpParams().set('supplier', supplierSlug).set('size', '100');
    return this.http.get<PageResponse<ProductRes>>(`${this.API_URL}/gallery`, { params });
  }

  getBySlug(slug: string): Observable<ProductAdminRes> {
    return this.http.get<ProductAdminRes>(`${this.API_URL}/${slug}`);
  }

  create(productReq: ProductReq, image?: File | null): Observable<void> {
    const formData = this.buildFormData(productReq, image ?? null);
    return this.http.post<void>(this.API_URL, formData);
  }

  update(slug: string, productReq: ProductReq, image?: File | null): Observable<void> {
    const formData = this.buildFormData(productReq, image ?? null);
    return this.http.put<void>(`${this.API_URL}/${slug}`, formData);
  }

  delete(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${slug}`);
  }

  private buildHttpParams(params: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((val: unknown) => {
            httpParams = httpParams.append(key, String(val));
          });
        } else {
          httpParams = httpParams.set(key, String(value));
        }
      }
    });
    return httpParams;
  }

  private buildFormData(productReq: ProductReq, image: File | null): FormData {
    const formData = new FormData();

    const productBlob = new Blob([JSON.stringify(productReq)], { type: 'application/json' });
    formData.append('product', productBlob);

    if (image) {
      formData.append('image', image);
    }

    return formData;
  }
}
