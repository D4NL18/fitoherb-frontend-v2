import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminNavComponent } from './admin-nav.component';

describe('AdminNavComponent', () => {
  let component: AdminNavComponent;
  let fixture: ComponentFixture<AdminNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()], 
      imports: [AdminNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNavComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeTab', 'products');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


