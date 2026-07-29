import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BannerCarouselComponent } from './banner-carousel.component';

describe('BannerCarouselComponent', () => {
  let component: BannerCarouselComponent;
  let fixture: ComponentFixture<BannerCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()], 
      imports: [BannerCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


