import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ModalGalleryComponent } from './modal-gallery.component';

describe('ModalGalleryComponent', () => {
  let component: ModalGalleryComponent;
  let fixture: ComponentFixture<ModalGalleryComponent>;

  const baseProduct: any = {
    name: 'B.O.P.E',
    slug: 'bope-black-skull',
    imageUrl: '/uploads/bope.webp',
    description: 'Pré-treino.',
    flavours: ['Fruit Punch', 'Limão', 'Melancia'],
    presentation: ['150g', '300g'],
    category: { name: 'Pré-Treinos', slug: 'pre-treinos' },
    supplier: { name: 'Black Skull', slug: 'black-skull', isHighlighted: false },
    createdAt: '01-01-2023 10:00:00'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [ModalGalleryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalGalleryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('product', baseProduct);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TDD Red — P-412: placeholder visual quando imageUrl ausente/nula vs fallback em erro de rede
  it('should render .placeholder-image and not .fallback-image when product imageUrl is null', () => {
    // Arrange
    fixture.componentRef.setInput('product', { ...baseProduct, imageUrl: null });

    // Act
    fixture.detectChanges();
    const imgEl: HTMLImageElement = fixture.nativeElement.querySelector('.image-side img');

    // Assert
    expect(component.isPlaceholderImage()).toBeTrue();
    expect(component.hasImageError()).toBeFalse();
    expect(component.formattedImageUrl()).toBe('assets/images/fitoherb-leaf-icon.png');
    expect(imgEl.classList.contains('placeholder-image')).toBeTrue();
    expect(imgEl.classList.contains('fallback-image')).toBeFalse();
  });

  it('should render .fallback-image on network error when imageUrl is present', () => {
    // Arrange
    const imgEl: HTMLImageElement = fixture.nativeElement.querySelector('.image-side img');

    // Act
    imgEl.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    // Assert
    expect(component.hasImageError()).toBeTrue();
    expect(component.isPlaceholderImage()).toBeFalse();
    expect(imgEl.classList.contains('fallback-image')).toBeTrue();
    expect(imgEl.classList.contains('placeholder-image')).toBeFalse();
  });

  it('should reset hasImageError and recalculate isPlaceholderImage via effect() on product switch', () => {
    // Arrange
    component.onImageError();
    fixture.detectChanges();
    expect(component.hasImageError()).toBeTrue();

    // Act
    fixture.componentRef.setInput('product', {
      ...baseProduct,
      slug: 'outro-produto',
      name: 'Outro Produto',
      imageUrl: null
    });
    fixture.detectChanges();

    // Assert
    expect(component.hasImageError()).toBeFalse();
    expect(component.isPlaceholderImage()).toBeTrue();
  });

  it('should render deduplicated flavour and presentation chips without exposing ERP codes', () => {
    // Arrange
    const chips: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.flavours-chips .chip');

    // Act
    const texts = Array.from(chips).map((c) => c.textContent?.trim());

    // Assert
    expect(texts).toEqual(['Fruit Punch', 'Limão', 'Melancia', '150g', '300g']);
  });
});
