import { Injectable, inject } from '@angular/core';
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

  constructor() { }

  getAll(): Observable<ProductCategoryRes[]> {
    return this.http.get<ProductCategoryRes[]>(`${this.API_URL}/get-all`);
  }
}
