import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SupplierRes } from '../../types/suppliers/SupplierRes.interface';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/suppliers`;

  private supplierState = signal<SupplierRes[]>([]);

  public suppliers = this.supplierState.asReadonly();

  constructor() {}

  getAll() {
    this.http.get<SupplierRes[]>(`${this.API_URL}/get-all`).subscribe({
      next: (res) => {
        this.supplierState.set(res);
      },
      error: (err) => console.error('Error loading suppliers', err),
    });
  }

}
