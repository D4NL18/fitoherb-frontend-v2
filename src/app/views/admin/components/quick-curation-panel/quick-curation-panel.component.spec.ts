import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickCurationPanelComponent } from './quick-curation-panel.component';

describe('QuickCurationPanelComponent', () => {
  let component: QuickCurationPanelComponent;
  let fixture: ComponentFixture<QuickCurationPanelComponent>;

  const makePendingItem = (index: number, overrides: Partial<any> = {}) => ({
    slug: `produto-pendente-${index}`,
    name: `Produto Pendente ${index}`,
    description: 'Descrição sugerida',
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
        id: `sku-${index}`,
        flavour: null,
        presentation: null,
        erpCode: 991000 + index,
        erpInactive: false,
        erpInactiveConfirmed: false,
        erpDescription: `PRODUTO ERP ${index}`
      }
    ],
    ...overrides
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickCurationPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickCurationPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render nothing when items is empty and not loading or errored', () => {
    // Arrange / Act
    const container = fixture.nativeElement.querySelector('.quick-curation-panel, [data-testid="quick-curation-panel"]');

    // Assert
    expect(container).toBeNull();
  });

  it('should render skeleton shimmer loaders when isLoading is true', () => {
    // Arrange
    fixture.componentRef.setInput('isLoading', true);

    // Act
    fixture.detectChanges();
    const skeletons = fixture.nativeElement.querySelectorAll('.skeleton-shimmer');

    // Assert
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render non-blocking error banner with retry button when error is set', () => {
    // Arrange
    spyOn(component.retry, 'emit');
    fixture.componentRef.setInput('error', 'Falha ao carregar fila de curadoria.');
    fixture.detectChanges();

    // Act
    const retryBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('[data-testid="curation-retry-btn"], .btn-curation-retry');

    // Assert
    expect(fixture.nativeElement.textContent).toContain('Falha ao carregar fila de curadoria.');
    expect(retryBtn).toBeTruthy();
    expect(retryBtn?.getAttribute('type')).toBe('button');
    retryBtn?.click();
    expect(component.retry.emit).toHaveBeenCalled();
  });

  it('should render pending items with erpCode, fallback warning, and emit selectItem on click', () => {
    // Arrange
    const item = makePendingItem(1, { fallbackCategoryWarning: true });
    spyOn(component.selectItem, 'emit');
    fixture.componentRef.setInput('items', [item]);
    fixture.detectChanges();

    // Act
    const triggerBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.curation-item__trigger');
    expect(triggerBtn).toBeTruthy();
    expect(triggerBtn.getAttribute('type')).toBe('button');
    triggerBtn.click();

    // Assert
    expect(fixture.nativeElement.textContent).toContain('Produto Pendente 1');
    expect(fixture.nativeElement.textContent).toContain('991001');
    expect(component.selectItem.emit).toHaveBeenCalledWith(item);
  });

  it('should emit ignoreItem without triggering selectItem when Ignorar button is clicked', () => {
    // Arrange
    const item = makePendingItem(2);
    spyOn(component.selectItem, 'emit');
    spyOn(component.ignoreItem, 'emit');
    fixture.componentRef.setInput('items', [item]);
    fixture.detectChanges();

    // Act
    const ignoreBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="curation-ignore-btn"], .btn-curation-ignore');
    expect(ignoreBtn).toBeTruthy();
    expect(ignoreBtn.getAttribute('type')).toBe('button');
    ignoreBtn.click();

    // Assert
    expect(component.ignoreItem.emit).toHaveBeenCalledWith(item);
    expect(component.selectItem.emit).not.toHaveBeenCalled();
  });

  it('should limit initial visible rows to 5 and allow expanding when > 5 items exist', () => {
    // Arrange
    const items = Array.from({ length: 7 }, (_, i) => makePendingItem(i + 1));
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    // Assert initial collapsed state
    expect(fixture.nativeElement.querySelectorAll('.curation-item').length).toBe(5);
    const expandBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="curation-expand-btn"], .btn-curation-expand');
    expect(expandBtn).toBeTruthy();

    // Act
    expandBtn.click();
    fixture.detectChanges();

    // Assert expanded state
    expect(fixture.nativeElement.querySelectorAll('.curation-item').length).toBe(7);
  });

  it('should disable actions for an item matching busySlug to prevent double-click', () => {
    // Arrange
    const item = makePendingItem(3);
    fixture.componentRef.setInput('items', [item]);
    fixture.componentRef.setInput('busySlug', item.slug);
    fixture.detectChanges();

    // Act
    const ignoreBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="curation-ignore-btn"], .btn-curation-ignore');

    // Assert
    expect(ignoreBtn.disabled).toBeTrue();
  });
});
