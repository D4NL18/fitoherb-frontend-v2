import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProductRes } from '../../types/products/productRes.interface';
import { PageResponse } from '../../types/page-response.interface';
import { ProductReq } from '../../types/products/ProductReq.interface';

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

  private adminProductsState = signal<PageResponse<ProductRes> | null>(null);
  public adminProducts = this.adminProductsState.asReadonly();

  private isGalleryLoadingState = signal<boolean>(false);
  public isGalleryLoading = this.isGalleryLoadingState.asReadonly();

  getGallery(params: any, append: boolean = false, onSuccess?: () => void) {
    let httpParams = this.buildHttpParams(params);

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

  getPaginated(search: string = '', page: number = 0, sortField: string = 'name', direction: string = 'ASC', categories: string[] = [], suppliers: string[] = []) {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('sortField', sortField)
      .set('direction', direction);

    categories.forEach(c => { params = params.append('category', c); });
    suppliers.forEach(s => { params = params.append('supplier', s); });

    this.http.get<PageResponse<ProductRes>>(this.API_URL, { params }).subscribe({
      next: (res) => this.adminProductsState.set(res),
      error: (err) => console.error('Erro ao carregar produtos (admin)', err)
    });
  }

  getBySlug(slug: string): Observable<ProductRes> {
    return this.http.get<ProductRes>(`${this.API_URL}/${slug}`);
  }

  create(productReq: ProductReq, image: File): Observable<void> {
    const formData = this.buildFormData(productReq, image);
    return this.http.post<void>(this.API_URL, formData);
  }

  update(slug: string, productReq: ProductReq, image: File | null): Observable<void> {
    const formData = this.buildFormData(productReq, image);
    return this.http.put<void>(`${this.API_URL}/${slug}`, formData);
  }

  delete(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${slug}`);
  }


  private buildHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        if (Array.isArray(params[key])) {
          params[key].forEach((val: any) => {
            httpParams = httpParams.append(key, val);
          });
        } else {
          httpParams = httpParams.set(key, params[key]);
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
