import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ErpProductsService } from './erp-products.service';
import { environment } from '../../../environments/environment';

describe('ErpProductsService', () => {
  let service: ErpProductsService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/erp-products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ErpProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should search ERP catalog by query q (code or name) and return envelope', () => {
    // Arrange
    const mockEnvelope = {
      data: [
        {
          erpCode: 131476,
          erpDescription: 'WHEY 100% PURE 900G BAUNILHA PROBIOTICA',
          ean: '7896438201234',
          erpBrand: 'PROBIOTICA',
          erpSupplier: 'PROBIOTICA LABS',
          inativoPro: false,
          inExterno01: true,
          alreadyMapped: false,
          mappedProductSlug: null,
          mappedProductName: null,
          mappedFlavour: null,
          mappedPresentation: null
        }
      ],
      meta: { timestamp: '2026-11-18T10:00:00-03:00', page: 0, size: 20, totalElements: 1, totalPages: 1 }
    };

    // Act
    let actual: any;
    service.search('whey').subscribe((res) => (actual = res));

    // Assert
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/search`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('whey');
    req.flush(mockEnvelope);
    expect(actual).toEqual(mockEnvelope);
  });

  it('should pass optional search filters (supplierSlug, includeInactive, excludeProductSlug) to GET /erp-products/search', () => {
    // Arrange
    const mockEnvelope = { data: [], meta: { timestamp: '2026-11-18T10:00:00-03:00' } };

    // Act
    service.search('131476', {
      supplierSlug: 'arrebite',
      includeInactive: true,
      excludeProductSlug: 'whey-900g',
      page: 0,
      size: 20
    }).subscribe();

    // Assert
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/search`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('131476');
    expect(req.request.params.get('supplierSlug')).toBe('arrebite');
    expect(req.request.params.get('includeInactive')).toBe('true');
    expect(req.request.params.get('excludeProductSlug')).toBe('whey-900g');
    req.flush(mockEnvelope);
  });

  it('should propagate 503 Service Unavailable when ERP catalog is offline', () => {
    // Arrange
    let errorResponse: any;

    // Act
    service.search('creatina').subscribe({
      error: (err) => (errorResponse = err)
    });

    // Assert
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/search`);
    req.flush(
      { status: 'SERVICE_UNAVAILABLE', message: 'Base ERP indisponível', code: 'ERP_CATALOG_UNAVAILABLE' },
      { status: 503, statusText: 'Service Unavailable' }
    );
    expect(errorResponse.status).toBe(503);
    expect(errorResponse.error.code).toBe('ERP_CATALOG_UNAVAILABLE');
  });

  it('should lookup a single ERP item by numeric erpCode', () => {
    // Arrange
    const mockEnvelope = {
      data: { erpCode: 580000, erpDescription: 'STEVITA LIQUIDO 25ML', inativoPro: false },
      meta: { timestamp: '2026-11-18T10:00:00-03:00' }
    };

    // Act
    let actual: any;
    service.getByErpCode(580000, 'stevita-liquido').subscribe((res) => (actual = res));

    // Assert
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/580000`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('excludeProductSlug')).toBe('stevita-liquido');
    req.flush(mockEnvelope);
    expect(actual.data.erpCode).toBe(580000);
  });

  it('should request batch variant suggestions via POST /erp-products/suggest-variants', () => {
    // Arrange
    const payload = { erpCodes: [131476, 131477], excludeProductSlug: 'whey-900g' };
    const mockEnvelope = {
      data: {
        suggestedTopology: 'FLAVOUR_ONLY',
        hasInactiveItems: false,
        hasConflictingItems: false,
        items: [
          { erpCode: 131476, suggestedFlavour: 'Baunilha', suggestedPresentation: null, inativoPro: false },
          { erpCode: 131477, suggestedFlavour: 'Chocolate', suggestedPresentation: null, inativoPro: false }
        ]
      },
      meta: { timestamp: '2026-11-18T10:00:00-03:00', count: 2 }
    };

    // Act
    let actual: any;
    service.suggestVariants(payload).subscribe((res) => (actual = res));

    // Assert
    const req = httpMock.expectOne(`${baseUrl}/suggest-variants`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockEnvelope);
    expect(actual.data.suggestedTopology).toBe('FLAVOUR_ONLY');
    expect(actual.data.items.length).toBe(2);
  });

  it('should fetch pending quick-curation items via GET /erp-products/curation-pending', () => {
    // Arrange
    const mockEnvelope = {
      data: [
        {
          slug: 'creatina-monohidratada-300g',
          name: 'Creatina Monohidratada 300g',
          description: null,
          categorySlug: 'suplementos',
          categoryName: 'Suplementos',
          supplierSlug: 'black-skull',
          supplierName: 'Black Skull',
          active: true,
          curationStatus: 'PENDING_IMAGE',
          fallbackCategoryWarning: false,
          fallbackSupplierWarning: false,
          imageUrl: null,
          topology: 'SIMPLE',
          createdAt: '18-11-2026 05:00:00',
          skus: [{ id: 'sku-1', flavour: null, presentation: null, erpCode: 991045, erpInactive: false, erpInactiveConfirmed: false }]
        }
      ],
      meta: { timestamp: '2026-11-18T05:00:00-03:00', pendingCount: 1 }
    };

    // Act
    let actual: any;
    service.getCurationPending().subscribe((res) => (actual = res));

    // Assert
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/curation-pending`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEnvelope);
    expect(actual.data.length).toBe(1);
    expect(actual.data[0].slug).toBe('creatina-monohidratada-300g');
  });

  it('should ignore pending product calling POST /erp-products/curation-pending/{slug}/ignore using slug (not id)', () => {
    // Arrange
    const slug = 'brinde-interno-sacola';
    const mockEnvelope = {
      data: {
        slug,
        active: false,
        curationStatus: 'IGNORED',
        ignoredErpCodes: [991045]
      },
      meta: { timestamp: '2026-11-18T09:00:00-03:00', aiCatalogRefreshed: true }
    };

    // Act
    let actual: any;
    service.ignorePending(slug, 'Brinde interno').subscribe((res) => (actual = res));

    // Assert
    const req = httpMock.expectOne(`${baseUrl}/curation-pending/${slug}/ignore`);
    expect(req.request.method).toBe('POST');
    expect(req.request.url).toContain(`/erp-products/curation-pending/${slug}/ignore`);
    expect(req.request.body).toEqual({ reason: 'Brinde interno' });
    req.flush(mockEnvelope);
    expect(actual.data.curationStatus).toBe('IGNORED');
    expect(actual.data.active).toBeFalse();
  });

  it('should send empty object body when ignorePending is called without reason and handle 403/404 errors', () => {
    // Arrange
    const slug = 'inexistente';
    let errStatus = 0;

    // Act
    service.ignorePending(slug).subscribe({
      error: (err) => (errStatus = err.status)
    });

    // Assert
    const req = httpMock.expectOne(`${baseUrl}/curation-pending/${slug}/ignore`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ status: 'NOT_FOUND', message: 'Produto não encontrado' }, { status: 404, statusText: 'Not Found' });
    expect(errStatus).toBe(404);
  });
});
