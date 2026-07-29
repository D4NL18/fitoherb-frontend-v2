import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ProductCategoriesService } from './product-categories.service';

describe('ProductCategoriesService', () => {
  let service: ProductCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProductCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

