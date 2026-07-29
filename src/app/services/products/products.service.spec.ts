import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProductsService } from './products.service';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../../types/page-response.interface';
import { ProductRes } from '../../types/products/productRes.interface';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ 
      providers: [provideHttpClient(), provideHttpClientTesting()] 
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch gallery and update state (no append)', () => {
    const mockPage: PageResponse<ProductRes> = { content: [], totalPages: 1, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true };
    
    expect(service.isGalleryLoading()).toBeFalse();
    
    let successCalled = false;
    service.getGallery({ category: 'test' }, false, () => successCalled = true);

    expect(service.isGalleryLoading()).toBeTrue();

    const req = httpMock.expectOne(req => req.url === `${environment.apiUrl}/products/gallery`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('category')).toBe('test');
    
    req.flush(mockPage);

    expect(service.productGallery()).toEqual(mockPage);
    expect(service.isGalleryLoading()).toBeFalse();
    expect(successCalled).toBeTrue();
  });

  it('should fetch paginated products and update admin state', () => {
    const mockPage: PageResponse<ProductRes> = { content: [], totalPages: 1, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true };
    
    service.getPaginated('test', 1, 'name', 'DESC', ['cat1'], ['sup1']);

    const req = httpMock.expectOne(req => req.url === `${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('test');
    expect(req.request.params.getAll('category')).toEqual(['cat1']);
    expect(req.request.params.getAll('supplier')).toEqual(['sup1']);
    
    req.flush(mockPage);

    expect(service.adminProducts()).toEqual(mockPage);
  });

  it('should get products by supplier', () => {
    const mockPage: PageResponse<ProductRes> = { content: [], totalPages: 1, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true };
    
    service.getProductsBySupplier('sup-slug').subscribe(res => {
      expect(res).toEqual(mockPage);
    });

    const req = httpMock.expectOne(req => req.url === `${environment.apiUrl}/products/gallery`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('supplier')).toBe('sup-slug');
    expect(req.request.params.get('size')).toBe('100');
    req.flush(mockPage);
  });

  it('should get product by slug', () => {
    const mockProduct = { id: 1, name: 'Prod' } as any;
    
    service.getBySlug('prod-slug').subscribe(res => {
      expect(res).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products/prod-slug`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should create product', () => {
    const productReq: any = { name: 'Prod' };
    const mockFile = new File([''], 'test.png', { type: 'image/png' });

    service.create(productReq, mockFile).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({});
  });

  it('should update product', () => {
    const productReq: any = { name: 'Prod' };
    const mockFile = new File([''], 'test.png', { type: 'image/png' });

    service.update('prod-slug', productReq, mockFile).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products/prod-slug`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({});
  });

  it('should delete product', () => {
    service.delete('prod-slug').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products/prod-slug`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
