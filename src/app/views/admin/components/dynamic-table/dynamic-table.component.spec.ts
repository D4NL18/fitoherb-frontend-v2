import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DynamicTableComponent } from './dynamic-table.component';

describe('DynamicTableComponent', () => {
  let component: DynamicTableComponent;
  let fixture: ComponentFixture<DynamicTableComponent>;

  const productColumns: any[] = [
    { label: 'Imagem', key: 'imageUrl', type: 'image' },
    { label: 'Nome', key: 'name', type: 'text' },
    { label: 'Código ERP', key: 'erpSummary', type: 'erp-code' },
    { label: 'Status ERP', key: 'erpStatus', type: 'erp-status' },
    { label: 'Ações', key: '', type: 'actions' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [DynamicTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', []);
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TDD Red — P-408 / P-406 / P-411: badge Inativo ERP, código direto e fallback de imagem
  it('should render direct ERP code for simple SKU, fallback leaf icon when imageUrl is null, and Inativo ERP badge', () => {
    // Arrange
    fixture.componentRef.setInput('columns', productColumns);
    fixture.componentRef.setInput('data', [
      {
        name: 'Mel Silvestre 500g',
        slug: 'mel-silvestre',
        imageUrl: null,
        topology: 'SIMPLE',
        erpStatus: 'INACTIVE_ALERT',
        active: false,
        skuCount: 1,
        primaryErpCode: 41025,
        skus: [{ id: '1', flavour: null, presentation: null, erpCode: 41025, erpInactive: true, erpInactiveConfirmed: true }]
      }
    ]);

    // Act
    fixture.detectChanges();
    const rowText: string = fixture.nativeElement.querySelector('tbody tr')?.textContent || '';
    const imgEl: HTMLImageElement = fixture.nativeElement.querySelector('tbody img.product-img');

    // Assert
    expect(rowText).toContain('41025');
    expect(rowText).toContain('Incompleto');
    expect(imgEl.getAttribute('src')).toContain('assets/images/fitoherb-leaf-icon.png');
  });

  it('should render Multi-SKU pill and open floating popover with position fixed on click', () => {
    // Arrange
    fixture.componentRef.setInput('columns', productColumns);
    fixture.componentRef.setInput('data', [
      {
        name: '100% Pure Whey 900g',
        slug: 'whey-900g',
        imageUrl: '/uploads/whey.webp',
        topology: 'FLAVOUR_ONLY',
        erpStatus: 'COMPLETE',
        active: true,
        skuCount: 2,
        primaryErpCode: 131476,
        skus: [
          { id: '1', flavour: 'Baunilha', presentation: null, erpCode: 131476, erpInactive: false, erpInactiveConfirmed: false },
          { id: '2', flavour: 'Chocolate', presentation: null, erpCode: 131477, erpInactive: true, erpInactiveConfirmed: true }
        ]
      }
    ]);
    fixture.detectChanges();

    // Act — click the Multi-SKU trigger button
    const triggerBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="erp-sku-popover-trigger"], .erp-sku-trigger, .btn-erp-multi');
    expect(triggerBtn).toBeTruthy();
    expect(triggerBtn.getAttribute('type')).toBe('button');
    triggerBtn.click();
    fixture.detectChanges();

    // Assert — popover opens with fixed positioning (anti-clipping Q-05) and lists SKUs
    const popoverEl: HTMLElement | null = fixture.nativeElement.querySelector('[data-testid="erp-sku-popover"], .erp-sku-popover');
    expect(popoverEl).toBeTruthy();
    const computedPos = window.getComputedStyle(popoverEl!).position || popoverEl!.style.position;
    expect(computedPos).toBe('fixed');
    expect(popoverEl!.textContent).toContain('Baunilha');
    expect(popoverEl!.textContent).toContain('131476');
    expect(popoverEl!.textContent).toContain('Chocolate');
    expect(popoverEl!.textContent).toContain('131477');

    // Act — Escape closes the popover
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.querySelector('[data-testid="erp-sku-popover"], .erp-sku-popover')).toBeNull();
  });

  it('should render explicit type="button" on row action and pagination buttons', () => {
    // Arrange
    fixture.componentRef.setInput('columns', productColumns);
    fixture.componentRef.setInput('data', [{ name: 'Prod', imageUrl: 'x.png', erpStatus: 'UNMAPPED', skus: [] }]);
    fixture.componentRef.setInput('totalElements', 20);

    // Act
    fixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');

    // Assert
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => {
      expect(btn.getAttribute('type')).toBe('button');
    });
  });
});
