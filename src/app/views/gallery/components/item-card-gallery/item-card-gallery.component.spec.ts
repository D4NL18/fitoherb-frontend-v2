import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ItemCardGalleryComponent } from './item-card-gallery.component';

describe('ItemCardGalleryComponent', () => {
  let component: ItemCardGalleryComponent;
  let fixture: ComponentFixture<ItemCardGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()], 
      imports: [ItemCardGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemCardGalleryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', { id: 1, name: 'test', scientificName: 'test', therapeuticUtility: 'test', createdAt: '2023-01-01T00:00:00.000Z', category: { name: 'Cat' }, supplier: { name: 'Sup', isHighlighted: false } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


