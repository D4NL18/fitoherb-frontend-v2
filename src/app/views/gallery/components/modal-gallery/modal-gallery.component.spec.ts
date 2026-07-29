import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ModalGalleryComponent } from './modal-gallery.component';

describe('ModalGalleryComponent', () => {
  let component: ModalGalleryComponent;
  let fixture: ComponentFixture<ModalGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()], 
      imports: [ModalGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalGalleryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('product', { category: { name: 'Cat' }, supplier: { name: 'Sup', isHighlighted: false }, createdAt: '2023-01-01T00:00:00.000Z' });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


