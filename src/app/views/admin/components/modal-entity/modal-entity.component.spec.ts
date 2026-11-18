import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormArray } from '@angular/forms';

import { ModalEntityComponent } from './modal-entity.component';
import { ProductCategoriesService } from '../../../../services/product-categories/product-categories.service';
import { SuppliersService } from '../../../../services/suppliers/suppliers.service';
import { environment } from '../../../../../environments/environment';

describe('ModalEntityComponent', () => {
  let component: ModalEntityComponent;
  let fixture: ComponentFixture<ModalEntityComponent>;
  let httpMock: HttpTestingController;

  const mockCategories = [
    { name: 'Proteínas', slug: 'proteinas', createdAt: '01-01-2026 00:00:00', imageUrl: '', count: 10 }
  ];
  const mockSuppliers = [
    { name: 'Probiótica', slug: 'probiotica', createdAt: '01-01-2026 00:00:00', imageUrl: '', isHighlighted: false, count: 10 },
    { name: 'Black Skull', slug: 'black-skull', createdAt: '01-01-2026 00:00:00', imageUrl: '', isHighlighted: true, count: 5 }
  ];

  const setupComponent = (
    type: 'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores' | 'Banners' = 'Produtos',
    mode: 'create' | 'edit' = 'create',
    data: any = null
  ) => {
    fixture = TestBed.createComponent(ModalEntityComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', type);
    fixture.componentRef.setInput('mode', mode);
    if (data !== null) {
      fixture.componentRef.setInput('data', data);
    }
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [ModalEntityComponent]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    // Seed categories & suppliers signals without network
    const catService = TestBed.inject(ProductCategoriesService) as any;
    const supService = TestBed.inject(SuppliersService) as any;
    catService.categoryState?.set(mockCategories);
    supService.supplierState?.set(mockSuppliers);

    setupComponent('Banners', 'create');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TDD Red — Contrato 3: isImageValid opcional na criação de Produtos e na edição PENDING_IMAGE
  it('should allow optional image (isImageValid = true) on Produtos creation and PENDING_IMAGE edit, while requiring image on Banners creation', () => {
    // Arrange — Banners create still requires image
    expect(component.isImageValid).toBeFalse();

    // Act — Produtos create without file
    setupComponent('Produtos', 'create');

    // Assert
    expect(component.isImageValid).toBeTrue();

    // Act — Produtos edit of PENDING_IMAGE item with null imageUrl
    setupComponent('Produtos', 'edit', {
      name: 'Creatina 300g',
      slug: 'creatina-300g',
      description: 'Creatina monohidratada',
      imageUrl: null,
      curationStatus: 'PENDING_IMAGE',
      topology: 'SIMPLE',
      category: { name: 'Proteínas', slug: 'proteinas' },
      supplier: { name: 'Black Skull', slug: 'black-skull' },
      skus: [{ id: '1', flavour: null, presentation: null, erpCode: 55001, erpInactive: false, erpInactiveConfirmed: false }]
    });

    // Assert
    expect(component.imagePreview).toBeNull();
    expect(component.isImageValid).toBeTrue();
  });

  // TDD Red — P-405: 4 topologias (SIMPLE, FLAVOUR_ONLY, PRESENTATION_ONLY, MATRIX)
  it('should support SIMPLE topology and emit skus JSON without requiring image', () => {
    // Arrange
    setupComponent('Produtos', 'create');
    spyOn(component.save, 'emit');

    component.entityForm.patchValue({
      name: 'Mel Silvestre 500g',
      description: 'Mel puro de florada silvestre.',
      categoryName: 'Proteínas',
      supplierName: 'Probiótica'
    });
    const skus = component.entityForm.get('skus') as FormArray;
    expect(skus).toBeTruthy();
    skus.at(0).patchValue({ erpCode: 41025, flavour: null, presentation: null });

    // Act
    component.onSubmit();

    // Assert
    expect(component.topology()).toBe('SIMPLE');
    expect(component.save.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        image: undefined,
        form: jasmine.objectContaining({
          name: 'Mel Silvestre 500g',
          categorySlug: 'proteinas',
          supplierSlug: 'probiotica',
          skus: [{ erpCode: 41025, flavour: null, presentation: null }]
        })
      })
    );
  });

  it('should support FLAVOUR_ONLY, PRESENTATION_ONLY and MATRIX topologies and block invalid/duplicate SKUs', () => {
    // Arrange
    setupComponent('Produtos', 'create');
    spyOn(component.save, 'emit');

    // Act — switch to FLAVOUR_ONLY
    component.setTopology('FLAVOUR_ONLY');
    fixture.detectChanges();
    expect(component.topology()).toBe('FLAVOUR_ONLY');

    // Act — switch to PRESENTATION_ONLY
    component.setTopology('PRESENTATION_ONLY');
    fixture.detectChanges();
    expect(component.topology()).toBe('PRESENTATION_ONLY');

    // Act — switch to MATRIX and populate 2 sparse SKUs
    component.setTopology('MATRIX');
    fixture.detectChanges();
    expect(component.topology()).toBe('MATRIX');

    component.entityForm.patchValue({
      name: 'B.O.P.E',
      description: 'Pré-treino.',
      categoryName: 'Proteínas',
      supplierName: 'Black Skull'
    });
    component.addSkuRow();
    const skus = component.entityForm.get('skus') as FormArray;
    skus.at(0).patchValue({ presentation: '150g', flavour: 'Fruit Punch', erpCode: 90101 });
    skus.at(1).patchValue({ presentation: '300g', flavour: 'Limão', erpCode: 90202 });

    component.onSubmit();

    // Assert valid MATRIX emission
    expect(component.save.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        form: jasmine.objectContaining({
          skus: [
            { presentation: '150g', flavour: 'Fruit Punch', erpCode: 90101 },
            { presentation: '300g', flavour: 'Limão', erpCode: 90202 }
          ]
        })
      })
    );

    // Act — duplicate erpCode inside same product should block submission
    (component.save.emit as jasmine.Spy).calls.reset();
    skus.at(1).patchValue({ erpCode: 90101 });
    component.onSubmit();

    // Assert blocked
    expect(component.save.emit).not.toHaveBeenCalled();
    expect(component.formError()).toBeTruthy();
  });

  // TDD Red — P-407: busca e importação em lote ERP por código ou nome
  it('should search ERP catalog by code/name and batch-import suggested variants into skus FormArray', fakeAsync(() => {
    // Arrange
    setupComponent('Produtos', 'create');

    // Act — trigger ERP search
    component.erpSearchControl.setValue('13147');
    tick(400);

    const searchReq = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/erp-products/search`);
    expect(searchReq.request.params.get('q')).toBe('13147');
    searchReq.flush({
      data: [
        {
          erpCode: 131476,
          erpDescription: 'WHEY 100% PURE 900G BAUN PROBIOTICA',
          ean: '7890001',
          erpBrand: 'PROBIOTICA',
          erpSupplier: 'PROBIOTICA',
          inativoPro: false,
          inExterno01: true,
          alreadyMapped: false,
          mappedProductSlug: null,
          mappedProductName: null,
          mappedFlavour: null,
          mappedPresentation: null
        },
        {
          erpCode: 131477,
          erpDescription: 'WHEY 100% PURE 900G CHOCO PROBIOTICA',
          ean: '7890002',
          erpBrand: 'PROBIOTICA',
          erpSupplier: 'PROBIOTICA',
          inativoPro: true,
          inExterno01: true,
          alreadyMapped: false,
          mappedProductSlug: null,
          mappedProductName: null,
          mappedFlavour: null,
          mappedPresentation: null
        },
        {
          erpCode: 131490,
          erpDescription: 'OUTRO WHEY JA MAPEADO',
          ean: null,
          erpBrand: 'PROBIOTICA',
          erpSupplier: 'PROBIOTICA',
          inativoPro: false,
          inExterno01: true,
          alreadyMapped: true,
          mappedProductSlug: 'outro-whey',
          mappedProductName: 'Outro Whey',
          mappedFlavour: 'Baunilha',
          mappedPresentation: null
        }
      ],
      meta: { timestamp: '2026-11-18T10:00:00-03:00' }
    });
    fixture.detectChanges();

    // Assert — ERP search results are stored in component state without drawer clutter
    expect(component.erpSearchResults().length).toBe(3);
    expect(component.isErpItemBlocked(component.erpSearchResults()[2])).toBeTrue();

    // Act — select the two unmapped items and import in batch
    component.toggleErpSelection(131476);
    component.toggleErpSelection(131477);
    component.importSelectedErpItems();

    const suggestReq = httpMock.expectOne(`${environment.apiUrl}/erp-products/suggest-variants`);
    expect(suggestReq.request.method).toBe('POST');
    expect(suggestReq.request.body.erpCodes).toEqual([131476, 131477]);
    suggestReq.flush({
      data: {
        suggestedTopology: 'FLAVOUR_ONLY',
        hasInactiveItems: true,
        hasConflictingItems: false,
        items: [
          {
            erpCode: 131476,
            erpDescription: 'WHEY 100% PURE 900G BAUN PROBIOTICA',
            suggestedFlavour: 'Baunilha',
            suggestedPresentation: null,
            inativoPro: false,
            inExterno01: true,
            alreadyMappedElsewhere: false,
            conflictingProductName: null,
            packageWarning: null
          },
          {
            erpCode: 131477,
            erpDescription: 'WHEY 100% PURE 900G CHOCO PROBIOTICA',
            suggestedFlavour: 'Chocolate',
            suggestedPresentation: null,
            inativoPro: true,
            inExterno01: true,
            alreadyMappedElsewhere: false,
            conflictingProductName: null,
            packageWarning: null
          }
        ]
      },
      meta: { timestamp: '2026-11-18T10:00:00-03:00', count: 2 }
    });
    fixture.detectChanges();

    // Assert — FormArray and topology populated, inactive confirmation required before submit
    expect(component.topology()).toBe('FLAVOUR_ONLY');
    const skus = component.entityForm.get('skus') as FormArray;
    expect(skus.length).toBe(2);
    expect(skus.at(0).value.flavour).toBe('Baunilha');
    expect(skus.at(1).value.flavour).toBe('Chocolate');
    expect(component.hasInactiveSkus()).toBeTrue();
  }));

  // TDD Red — P-413: pré-preenchimento de PENDING_IMAGE e focusImageUpload
  it('should pre-fill modal from PENDING_IMAGE item and highlight image upload when focusImageUpload is true', () => {
    // Arrange
    fixture = TestBed.createComponent(ModalEntityComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'Produtos');
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('focusImageUpload', true);
    fixture.componentRef.setInput('data', {
      slug: 'creatina-300g',
      name: 'Creatina 300g',
      description: 'Creatina monohidratada.',
      category: { name: 'Proteínas', slug: 'proteinas' },
      supplier: { name: 'Black Skull', slug: 'black-skull' },
      imageUrl: null,
      curationStatus: 'PENDING_IMAGE',
      topology: 'SIMPLE',
      skus: [{ id: '1', flavour: null, presentation: null, erpCode: 991045, erpInactive: false, erpInactiveConfirmed: false }]
    });

    // Act
    fixture.detectChanges();
    const uploadSection: HTMLElement | null = fixture.nativeElement.querySelector('.image-upload-section');
    const skus = component.entityForm.get('skus') as FormArray;

    // Assert
    expect(component.entityForm.get('name')?.value).toBe('Creatina 300g');
    expect(skus.at(0).value.erpCode).toBe(991045);
    expect(uploadSection?.classList.contains('upload-highlight') || uploadSection?.classList.contains('focus-highlight')).toBeTrue();
  });
});
