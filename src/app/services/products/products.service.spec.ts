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
    const mockPage: PageResponse<ProductRes> = {
      content: [],
      totalPages: 1,
      totalElements: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: true
    };

    expect(service.isGalleryLoading()).toBeFalse();

    let successCalled = false;
    service.getGallery({ category: 'test' }, false, () => (successCalled = true));

    expect(service.isGalleryLoading()).toBeTrue();

    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/products/gallery`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('category')).toBe('test');

    req.flush(mockPage);

    expect(service.productGallery()).toEqual(mockPage);
    expect(service.isGalleryLoading()).toBeFalse();
    expect(successCalled).toBeTrue();
  });

  it('should fetch paginated products and update admin state', () => {
    const mockPage: PageResponse<any> = {
      content: [],
      totalPages: 1,
      totalElements: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: true
    };

    service.getPaginated('test', 1, 'name', 'DESC', ['cat1'], ['sup1']);

    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('test');
    expect(req.request.params.getAll('category')).toEqual(['cat1']);
    expect(req.request.params.getAll('supplier')).toEqual(['sup1']);

    req.flush(mockPage);

    expect(service.adminProducts()).toEqual(mockPage);
  });

  // TDD Red — P-408 / US-P6: filtro por erpStatus e busca por Id_Pro
  it('should append erpStatus query params when getPaginated receives erpStatuses', () => {
    // Arrange
    const mockPage: PageResponse<any> = {
      content: [
        {
          name: '100% Pure Whey 900g',
          slug: 'whey-900g',
          imageUrl: null,
          flavours: ['Baunilha'],
          presentation: [],
          topology: 'FLAVOUR_ONLY',
          erpStatus: 'COMPLETE',
          skuCount: 1,
          primaryErpCode: 131476,
          active: true,
          curationStatus: 'COMPLETED',
          skus: []
        }
      ],
      totalPages: 1,
      totalElements: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false
    };

    // Act
    service.getPaginated('131476', 0, 'name', 'ASC', [], [], ['UNMAPPED', 'INACTIVE_ALERT']);

    // Assert
    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('131476');
    expect(req.request.params.getAll('erpStatus')).toEqual(['UNMAPPED', 'INACTIVE_ALERT']);
    req.flush(mockPage);
    expect(service.adminProducts()?.content[0].primaryErpCode).toBe(131476);
  });

  it('should get products by supplier', () => {
    const mockPage: PageResponse<ProductRes> = {
      content: [],
      totalPages: 1,
      totalElements: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: true
    };

    service.getProductsBySupplier('sup-slug').subscribe((res) => {
      expect(res).toEqual(mockPage);
    });

    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/products/gallery`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('supplier')).toBe('sup-slug');
    expect(req.request.params.get('size')).toBe('100');
    req.flush(mockPage);
  });

  it('should get product by slug with admin SKU details', () => {
    const mockProduct: any = {
      name: 'B.O.P.E',
      slug: 'bope',
      imageUrl: null,
      topology: 'MATRIX',
      erpStatus: 'COMPLETE',
      active: true,
      curationStatus: 'PENDING_IMAGE',
      skus: [{ id: 'sku-1', flavour: 'Limão', presentation: '150g', erpCode: 90102, erpInactive: false, erpInactiveConfirmed: false }]
    };

    service.getBySlug('bope').subscribe((res: any) => {
      expect(res).toEqual(mockProduct);
      expect(res.skus.length).toBe(1);
      expect(res.curationStatus).toBe('PENDING_IMAGE');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products/bope`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should create product sending FormData with product JSON (skus) and optional image', async () => {
    // Arrange
    const productReq: any = {
      name: 'Mel Silvestre 500g',
      description: 'Mel puro.',
      categorySlug: 'naturais',
      supplierSlug: 'apisnutri',
      allowInactiveErp: false,
      skus: [{ erpCode: 41025, flavour: null, presentation: null }]
    };
    const mockFile = new File(['img'], 'mel.png', { type: 'image/png' });

    // Act
    service.create(productReq, mockFile).subscribe();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    const formData = req.request.body as FormData;
    const productBlob = formData.get('product') as Blob;
    expect(productBlob).toBeTruthy();
    const parsed = JSON.parse(await productBlob.text());
    expect(parsed.skus).toEqual([{ erpCode: 41025, flavour: null, presentation: null }]);
    expect(formData.get('image')).toBeTruthy();
    req.flush(null);
  });

  // TDD Red — Contrato 3: envio de FormData com skus JSON e imagem opcional na criacao
  it('should create product without image when image is null/undefined', async () => {
    // Arrange
    const productReq: any = {
      name: 'Creatina Pura',
      categorySlug: 'suplementos',
      supplierSlug: 'black-skull',
      skus: [{ erpCode: 55001, flavour: null, presentation: null }]
    };

    // Act
    service.create(productReq, null).subscribe();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('POST');
    const formData = req.request.body as FormData;
    expect(formData.get('product')).toBeTruthy();
    expect(formData.get('image')).toBeNull();
    req.flush(null);
  });

  it('should update product sending FormData with skus JSON and omit image when null', async () => {
    // Arrange
    const productReq: any = {
      name: 'Whey 900g',
      categorySlug: 'proteinas',
      supplierSlug: 'probiotica',
      allowInactiveErp: true,
      skus: [{ erpCode: 131476, flavour: 'Baunilha', presentation: null }]
    };

    // Act
    service.update('whey-900g', productReq, null).subscribe();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/products/whey-900g`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body instanceof FormData).toBeTrue();
    const formData = req.request.body as FormData;
    const parsed = JSON.parse(await (formData.get('product') as Blob).text());
    expect(parsed.allowInactiveErp).toBeTrue();
    expect(parsed.skus.length).toBe(1);
    expect(formData.get('image')).toBeNull();
    req.flush(null);
  });

  it('should delete product', () => {
    service.delete('prod-slug').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products/prod-slug`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
