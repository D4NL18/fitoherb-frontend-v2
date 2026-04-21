import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductCategoryRes } from '../../types/product-categories/productCategoriesRes.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/product_categories`;

  private productCategoriesState = signal<ProductCategoryRes[]>([]);

  public productCategories = this.productCategoriesState.asReadonly();

  getAll() {
    this.http.get<ProductCategoryRes[]>(`${this.API_URL}/get-all`).subscribe({
      next: (res) => {
        this.productCategoriesState.set(res);
      },
      error: (err) => console.error('Error loading product categories', err)
    });
  }
}
