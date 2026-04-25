import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductCategoryRes } from '../../types/product-categories/productCategoriesRes.interface';
import { PageResponse } from '../../types/page-response.interface';
import { ProductCategoryReq } from '../../types/product-categories/productCategoriesReq.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/product_categories`;

  private categoryState = signal<ProductCategoryRes[]>([]);
  public productCategories = this.categoryState.asReadonly();

  private paginatedCategoryState = signal<PageResponse<ProductCategoryRes> | null>(null);
  public paginatedCategories = this.paginatedCategoryState.asReadonly();

  getAll() {
    this.http.get<ProductCategoryRes[]>(`${this.API_URL}/get-all`).subscribe({
      next: (res) => this.categoryState.set(res),
      error: (err) => console.error('Erro ao carregar categorias', err),
    });
  }

  getPaginated(search: string = '', page: number = 0, sortField: string = 'name', direction: string = 'ASC') {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('sortField', sortField)
      .set('direction', direction);

    this.http.get<PageResponse<ProductCategoryRes>>(this.API_URL, { params }).subscribe({
      next: (res) => this.paginatedCategoryState.set(res),
      error: (err) => console.error('Erro na paginação de categorias', err),
    });
  }

  getBySlug(slug: string): Observable<ProductCategoryRes> {
    return this.http.get<ProductCategoryRes>(`${this.API_URL}/${slug}`);
  }

  create(categoryReq: ProductCategoryReq, image: File): Observable<void> {
    const formData = this.buildFormData(categoryReq, image);
    return this.http.post<void>(this.API_URL, formData).pipe(
      tap(() => this.getAll()) // Atualiza lista de dropdowns
    );
  }

  update(slug: string, categoryReq: ProductCategoryReq, image: File): Observable<void> {
    const formData = this.buildFormData(categoryReq, image);
    return this.http.put<void>(`${this.API_URL}/${slug}`, formData);
  }

  delete(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${slug}`).pipe(
      tap(() => this.getAll())
    );
  }

  private buildFormData(categoryReq: ProductCategoryReq, image: File): FormData {
    const formData = new FormData();

    const categoryBlob = new Blob([JSON.stringify(categoryReq)], { type: 'application/json' });

    formData.append('product_category', categoryBlob);
    formData.append('image', image);

    return formData;
  }
}
