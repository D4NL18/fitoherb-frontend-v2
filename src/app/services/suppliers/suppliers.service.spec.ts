import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SuppliersService } from './suppliers.service';
import { environment } from '../../../environments/environment';
import { SupplierRes } from '../../types/suppliers/SupplierRes.interface';
import { PageResponse } from '../../types/page-response.interface';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ 
      providers: [provideHttpClient(), provideHttpClientTesting()] 
    });
    service = TestBed.inject(SuppliersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all suppliers and update state', () => {
    const mockSuppliers: any[] = [{ name: 'Sup', slug: 'sup', description: 'desc', createdAt: '2023', productCount: 0 }];
    
    service.getAll();

    const req = httpMock.expectOne(`${environment.apiUrl}/suppliers/get-all`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSuppliers);

    expect(service.suppliers()).toEqual(mockSuppliers);
  });

  it('should fetch paginated suppliers and update state', () => {
    const mockPage: PageResponse<SupplierRes> = { content: [], totalPages: 1, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true };
    
    service.getPaginated('test', 1, 'name', 'DESC');

    const req = httpMock.expectOne(req => req.url === `${environment.apiUrl}/suppliers`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('test');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('sortField')).toBe('name');
    expect(req.request.params.get('direction')).toBe('DESC');
    
    req.flush(mockPage);

    expect(service.paginatedSuppliers()).toEqual(mockPage);
  });

  it('should get supplier by slug', () => {
    const mockSupplier: any = { name: 'Sup', slug: 'sup-slug', description: 'desc', createdAt: '2023', productCount: 0 };
    
    service.getBySlug('sup-slug').subscribe(res => {
      expect(res).toEqual(mockSupplier);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/suppliers/sup-slug`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSupplier);
  });

  it('should create supplier', () => {
    const supplierReq: any = { name: 'Sup', description: 'desc' };
    const mockFile = new File([''], 'test.png', { type: 'image/png' });

    service.create(supplierReq, mockFile).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/suppliers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({});

    // tap(() => this.getAll()) triggers a GET request
    const getAllReq = httpMock.expectOne(`${environment.apiUrl}/suppliers/get-all`);
    expect(getAllReq.request.method).toBe('GET');
    getAllReq.flush([]);
  });

  it('should update supplier', () => {
    const supplierReq: any = { name: 'Sup', description: 'desc' };
    const mockFile = new File([''], 'test.png', { type: 'image/png' });

    service.update('sup-slug', supplierReq, mockFile).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/suppliers/sup-slug`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({});
  });

  it('should delete supplier without deleting products', () => {
    service.delete('sup-slug').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/suppliers/sup-slug`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.has('deleteProducts')).toBeFalse();
    req.flush({});

    // tap(() => this.getAll()) triggers a GET request
    const getAllReq = httpMock.expectOne(`${environment.apiUrl}/suppliers/get-all`);
    expect(getAllReq.request.method).toBe('GET');
    getAllReq.flush([]);
  });

  it('should delete supplier AND products', () => {
    service.delete('sup-slug', true).subscribe();

    const req = httpMock.expectOne(req => req.url === `${environment.apiUrl}/suppliers/sup-slug`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.get('deleteProducts')).toBe('true');
    req.flush({});

    const getAllReq = httpMock.expectOne(`${environment.apiUrl}/suppliers/get-all`);
    getAllReq.flush([]);
  });
});
