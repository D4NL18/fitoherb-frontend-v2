import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ItemCardGalleryComponent } from './item-card-gallery.component';

describe('ItemCardGalleryComponent', () => {
  let component: ItemCardGalleryComponent;
  let fixture: ComponentFixture<ItemCardGalleryComponent>;

  const baseProduct: any = {
    name: '100% Pure Whey 900g',
    slug: 'whey-900g',
    imageUrl: '/uploads/whey.webp',
    description: 'Proteína concentrada.',
    flavours: ['Baunilha', 'Chocolate', 'Morango'],
    presentation: [],
    createdAt: '01-01-2023 10:00:00',
    category: { name: 'Proteínas', slug: 'proteinas' },
    supplier: { name: 'Probiótica', slug: 'probiotica', isHighlighted: false }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [ItemCardGalleryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCardGalleryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', baseProduct);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TDD Red — P-412: placeholder visual quando imageUrl ausente/nula
  it('should mark isPlaceholderImage true and apply .placeholder-image when imageUrl is null', () => {
    // Arrange
    fixture.componentRef.setInput('product', { ...baseProduct, imageUrl: null });

    // Act
    fixture.detectChanges();
    const imgEl: HTMLImageElement = fixture.nativeElement.querySelector('img');

    // Assert
    expect(component.isPlaceholderImage()).toBeTrue();
    expect(component.hasImageError()).toBeFalse();
    expect(component.formattedImageUrl()).toBe('assets/images/fitoherb-leaf-icon.png');
    expect(imgEl.classList.contains('placeholder-image')).toBeTrue();
    expect(imgEl.classList.contains('fallback-image')).toBeFalse();
  });

  it('should apply .fallback-image (and not .placeholder-image) on real image network error', () => {
    // Arrange
    const imgEl: HTMLImageElement = fixture.nativeElement.querySelector('img');

    // Act
    imgEl.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    // Assert
    expect(component.hasImageError()).toBeTrue();
    expect(component.isPlaceholderImage()).toBeFalse();
    expect(component.formattedImageUrl()).toBe('assets/images/fitoherb-leaf-icon.png');
    expect(imgEl.classList.contains('fallback-image')).toBeTrue();
    expect(imgEl.classList.contains('placeholder-image')).toBeFalse();
  });

  it('should reset hasImageError and recalculate isPlaceholderImage via effect() when product changes', () => {
    // Arrange
    component.onImageError();
    fixture.detectChanges();
    expect(component.hasImageError()).toBeTrue();

    // Act — switch to a new product with a valid imageUrl
    fixture.componentRef.setInput('product', {
      ...baseProduct,
      slug: 'creatina-300g',
      name: 'Creatina 300g',
      imageUrl: '/uploads/creatina.webp'
    });
    fixture.detectChanges();

    // Assert
    expect(component.hasImageError()).toBeFalse();
    expect(component.isPlaceholderImage()).toBeFalse();

    // Act — switch again to a product without imageUrl
    fixture.componentRef.setInput('product', {
      ...baseProduct,
      slug: 'sem-foto',
      name: 'Produto Sem Foto',
      imageUrl: null
    });
    fixture.detectChanges();

    // Assert
    expect(component.hasImageError()).toBeFalse();
    expect(component.isPlaceholderImage()).toBeTrue();
  });

  // TDD Red — P-401 / P-408: apresentação visível sem flavours e zero dados ERP
  it('should display presentation list when flavours is empty and never leak ERP fields', () => {
    // Arrange
    fixture.componentRef.setInput('product', {
      ...baseProduct,
      name: 'Stevita Líquido',
      flavours: [],
      presentation: ['25ml', '60ml'],
      erpCode: 580000
    });

    // Act
    fixture.detectChanges();
    const cardText: string = fixture.nativeElement.textContent;

    // Assert
    expect(cardText).toContain('25ml, 60ml');
    expect(cardText).not.toContain('580000');
  });
});
