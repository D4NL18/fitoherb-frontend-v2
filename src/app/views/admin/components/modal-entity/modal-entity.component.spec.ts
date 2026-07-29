import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ModalEntityComponent } from './modal-entity.component';

describe('ModalEntityComponent', () => {
  let component: ModalEntityComponent;
  let fixture: ComponentFixture<ModalEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()], 
      imports: [ModalEntityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEntityComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'Banners');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


