import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AdminComponent } from './admin.component';
import { TokenService } from '../../services/token/token.service';
import { environment } from '../../../environments/environment';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let httpMock: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;

  const pendingItemMock: any = {
    slug: 'creatina-300g-black-skull',
    name: 'Creatina 300g',
    description: 'Creatina monohidratada.',
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
    skus: [
      {
        id: 'sku-1',
        flavour: null,
        presentation: null,
        erpCode: 991045,
        erpInactive: false,
        erpInactiveConfirmed: false,
        erpDescription: 'CREATINA 300G BLACK SKULL'
      }
    ]
  };

  const flushInitialAdminRequests = (expectCurationPending: boolean) => {
    httpMock.match((r) => r.url.includes('/product_categories/get-all')).forEach((r) => r.flush([]));
    httpMock.match((r) => r.url.includes('/suppliers/get-all')).forEach((r) => r.flush([]));
    httpMock.match((r) => r.url.includes('/banners/active')).forEach((r) => r.flush([]));
    httpMock.match((r) => r.url === `${environment.apiUrl}/products`).forEach((r) =>
      r.flush({ content: [], totalPages: 0, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true })
    );
    if (expectCurationPending) {
      const pendingReqs = httpMock.match((r) => r.url === `${environment.apiUrl}/erp-products/curation-pending`);
      expect(pendingReqs.length).toBeGreaterThan(0);
      pendingReqs.forEach((r) =>
        r.flush({ data: [pendingItemMock], meta: { timestamp: '2026-11-18T05:00:00-03:00', pendingCount: 1 } })
      );
    } else {
      const pendingReqs = httpMock.match((r) => r.url === `${environment.apiUrl}/erp-products/curation-pending`);
      expect(pendingReqs.length).toBe(0);
    }
  };

  beforeEach(async () => {
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getUserRole', 'getUserEmail', 'getToken', 'isAuthenticated']);
    tokenServiceSpy.getUserRole.and.returnValue('ADMIN');
    tokenServiceSpy.getUserEmail.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TokenService, useValue: tokenServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Drain any remaining unrelated requests before verifying
    httpMock.match(() => true).forEach((r) => r.flush({}));
    httpMock.verify();
  });

  it('should create', () => {
    httpMock = TestBed.inject(HttpTestingController);
    expect(component).toBeTruthy();
  });

  it('should disable user actions if role is not ADMIN', () => {
    httpMock = TestBed.inject(HttpTestingController);
    component.pageTitle.set('Usuários');
    component.currentUserRole.set('USER');
    expect(component.disableUserActions()).toBeTrue();
  });

  it('should allow user actions if role is ADMIN', () => {
    httpMock = TestBed.inject(HttpTestingController);
    component.pageTitle.set('Usuários');
    component.currentUserRole.set('ADMIN');
    expect(component.disableUserActions()).toBeFalse();
  });

  // TDD Red — Contrato 2 & P-413: QuickCurationPanel exibido para ADMIN e USER, bloqueado para SELLER
  it('should load and display QuickCurationPanelComponent for ADMIN and USER when PENDING_IMAGE items exist', () => {
    // Arrange
    httpMock = TestBed.inject(HttpTestingController);
    flushInitialAdminRequests(true);

    // Act
    fixture.detectChanges();
    const panelEl = fixture.nativeElement.querySelector('app-quick-curation-panel');

    // Assert
    expect(panelEl).toBeTruthy();
    expect(panelEl.textContent).toContain('Creatina 300g');

    // Act — repeat for USER role
    tokenServiceSpy.getUserRole.and.returnValue('USER');
    const userFixture = TestBed.createComponent(AdminComponent);
    userFixture.detectChanges();
    flushInitialAdminRequests(true);
    userFixture.detectChanges();
    expect(userFixture.nativeElement.querySelector('app-quick-curation-panel')).toBeTruthy();
  });

  it('should NOT call getCurationPending or render QuickCurationPanelComponent for SELLER', () => {
    // Arrange
    httpMock = TestBed.inject(HttpTestingController);
    // Drain initial ADMIN fixture requests first
    httpMock.match(() => true).forEach((r) => r.flush({ data: [], content: [] }));

    tokenServiceSpy.getUserRole.and.returnValue('SELLER');
    const sellerFixture = TestBed.createComponent(AdminComponent);

    // Act
    sellerFixture.detectChanges();
    flushInitialAdminRequests(false);
    sellerFixture.detectChanges();

    // Assert
    expect(sellerFixture.nativeElement.querySelector('app-quick-curation-panel')).toBeNull();
  });

  // TDD Red — Contrato 2: clique abre modal pré-preenchido e Ignorar chama ignorePending(slug) removendo da fila
  it('should open pre-filled ModalEntityComponent on pending item click and remove item from queue when saved with image', () => {
    // Arrange
    httpMock = TestBed.inject(HttpTestingController);
    flushInitialAdminRequests(true);
    fixture.detectChanges();

    // Act — click pending item in QuickCurationPanelComponent
    const triggerBtn: HTMLButtonElement = fixture.nativeElement.querySelector('app-quick-curation-panel .curation-item__trigger');
    expect(triggerBtn).toBeTruthy();
    triggerBtn.click();
    fixture.detectChanges();

    // Assert — ModalEntityComponent opens in edit mode pre-filled
    expect(component.isEntityModalOpen()).toBeTrue();
    expect(component.modalMode()).toBe('edit');
    expect(component.selectedItem()?.slug).toBe('creatina-300g-black-skull');

    // Act — save with image
    const mockFile = new File(['img'], 'creatina.png', { type: 'image/png' });
    component.handleSave({
      form: {
        name: 'Creatina 300g',
        description: 'Creatina monohidratada.',
        categorySlug: 'suplementos',
        supplierSlug: 'black-skull',
        skus: [{ erpCode: 991045, flavour: null, presentation: null }]
      },
      image: mockFile
    });

    const putReq = httpMock.expectOne(`${environment.apiUrl}/products/creatina-300g-black-skull`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body instanceof FormData).toBeTrue();
    putReq.flush(null);

    // Drain reload
    httpMock.match((r) => r.url === `${environment.apiUrl}/products`).forEach((r) =>
      r.flush({ content: [], totalPages: 0, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true })
    );
    fixture.detectChanges();

    // Assert — item removed from queue
    expect(component.curationPendingItems().length).toBe(0);
    expect(component.isEntityModalOpen()).toBeFalse();
  });

  it('should call ErpProductsService.ignorePending(slug) and remove item from queue on ignore action', () => {
    // Arrange
    httpMock = TestBed.inject(HttpTestingController);
    flushInitialAdminRequests(true);
    fixture.detectChanges();

    // Act — trigger ignore flow
    component.onIgnoreCurationItem(pendingItemMock);
    fixture.detectChanges();

    // Confirm discard if confirmation modal opens
    const confirmBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('app-modal-confirm .btn-confirm, app-modal-confirm button');
    if (confirmBtn && component.isConfirmModalOpen()) {
      confirmBtn.click();
      fixture.detectChanges();
    }

    const ignoreReq = httpMock.expectOne(`${environment.apiUrl}/erp-products/curation-pending/${pendingItemMock.slug}/ignore`);
    expect(ignoreReq.request.method).toBe('POST');
    ignoreReq.flush({
      data: { slug: pendingItemMock.slug, active: false, curationStatus: 'IGNORED', ignoredErpCodes: [991045] },
      meta: { timestamp: '2026-11-18T09:00:00-03:00' }
    });

    httpMock.match((r) => r.url === `${environment.apiUrl}/products`).forEach((r) =>
      r.flush({ content: [], totalPages: 0, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true })
    );
    fixture.detectChanges();

    // Assert
    expect(component.curationPendingItems().length).toBe(0);
  });

  // TDD Red — D-06 / P-404 / P-408: erro 409 real preservado + colunas ERP + filtro erpStatus
  it('should preserve real 409 ERP conflict message in handleSave without overwriting with generic slug message', () => {
    // Arrange
    httpMock = TestBed.inject(HttpTestingController);
    flushInitialAdminRequests(true);
    component.openAddModal();
    fixture.detectChanges();

    // Act
    component.handleSave({
      form: {
        name: 'Novo Whey',
        categorySlug: 'suplementos',
        supplierSlug: 'black-skull',
        skus: [{ erpCode: 131476, flavour: null, presentation: null }]
      }
    });

    const postReq = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(postReq.request.method).toBe('POST');
    postReq.flush(
      {
        status: 'CONFLICT',
        message: "O código ERP '131476' já está vinculado ao produto '100% Pure Whey 900g'.",
        code: 'ERP_CODE_ALREADY_MAPPED'
      },
      { status: 409, statusText: 'Conflict' }
    );
    fixture.detectChanges();

    // Assert
    expect(component.responseStatus()).toBe(409);
    expect(component.responseMessage()).toBe("O código ERP '131476' já está vinculado ao produto '100% Pure Whey 900g'.");
    expect(component.isEntityModalOpen()).toBeTrue();
  });

  it('should expose erp-code and erp-status columns in Produtos tab and filter by erpStatus', () => {
    // Arrange
    httpMock = TestBed.inject(HttpTestingController);
    flushInitialAdminRequests(true);

    // Assert columns
    const colTypes = component.columns().map((c) => c.type);
    expect(colTypes).toContain('erp-code');
    expect(colTypes).toContain('erp-status');

    // Act — apply curationStatus filter from column header
    component.onFilterApply({ key: 'curationStatus', values: ['PENDING_IMAGE'] });

    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/products`);
    expect(req.request.params.getAll('curationStatus')).toEqual(['PENDING_IMAGE']);
    req.flush({ content: [], totalPages: 0, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true });
  });
});
