import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupplierRes } from '../../types/suppliers/SupplierRes.interface';
import { SupplierReq } from '../../types/suppliers/SupplierReq.interface';
import { PageResponse } from '../../types/page-response.interface';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/suppliers`;

  private supplierState = signal<SupplierRes[]>([]);
  public suppliers = this.supplierState.asReadonly();

  private paginatedSupplierState = signal<PageResponse<SupplierRes> | null>(null);
  public paginatedSuppliers = this.paginatedSupplierState.asReadonly();

  getAll() {
    this.http.get<SupplierRes[]>(`${this.API_URL}/get-all`).subscribe({
      next: (res) => this.supplierState.set(res),
      error: (err) => console.error('Erro ao carregar fornecedores', err),
    });
  }

  getPaginated(search: string = '', page: number = 0, sortField: string = 'name', direction: string = 'ASC') {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('sortField', sortField)
      .set('direction', direction);

    this.http.get<PageResponse<SupplierRes>>(this.API_URL, { params }).subscribe({
      next: (res) => this.paginatedSupplierState.set(res),
      error: (err) => console.error('Erro na paginação de fornecedores', err),
    });
  }

  getBySlug(slug: string): Observable<SupplierRes> {
    return this.http.get<SupplierRes>(`${this.API_URL}/${slug}`);
  }

  create(supplierReq: SupplierReq, image: File): Observable<void> {
    const formData = this.buildFormData(supplierReq, image);
    return this.http.post<void>(this.API_URL, formData).pipe(
      tap(() => this.getAll())
    );
  }

  update(slug: string, supplierReq: SupplierReq, image: File): Observable<void> {
    const formData = this.buildFormData(supplierReq, image);
    return this.http.put<void>(`${this.API_URL}/${slug}`, formData);
  }

  delete(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${slug}`).pipe(
      tap(() => this.getAll())
    );
  }


  private buildFormData(supplierReq: SupplierReq, image: File): FormData {
    const formData = new FormData();

    const supplierBlob = new Blob([JSON.stringify(supplierReq)], { type: 'application/json' });

    formData.append('supplier', supplierBlob);
    formData.append('image', image);

    return formData;
  }
}
