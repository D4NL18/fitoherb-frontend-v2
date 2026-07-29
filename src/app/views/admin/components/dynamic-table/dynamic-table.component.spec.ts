import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DynamicTableComponent } from './dynamic-table.component';

describe('DynamicTableComponent', () => {
  let component: DynamicTableComponent;
  let fixture: ComponentFixture<DynamicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()], 
      imports: [DynamicTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', []);
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


