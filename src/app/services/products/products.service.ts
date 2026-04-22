import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductRes } from '../../types/products/productRes.interface';
import { PageResponse } from '../../types/page-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/products`;

  private productGalleryState = signal<PageResponse<ProductRes>>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    size: 0,
    number: 0,
    first: false,
    last: false,
    empty: true,
  });
  public productGallery = this.productGalleryState.asReadonly();

  getGallery(params: any, append: boolean = false) {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    this.http
      .get<
        PageResponse<ProductRes>
      >(`${this.API_URL}/gallery`, { params: httpParams })
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
        },
      });
  }
}
