import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCardGalleryComponent } from './item-card-gallery.component';

describe('ItemCardGalleryComponent', () => {
  let component: ItemCardGalleryComponent;
  let fixture: ComponentFixture<ItemCardGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemCardGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemCardGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
