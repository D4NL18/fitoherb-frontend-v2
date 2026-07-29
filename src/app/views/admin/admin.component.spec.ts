import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable user actions if role is not ADMIN', () => {
    component.pageTitle.set('Usuários');
    component.currentUserRole.set('USER');
    expect(component.disableUserActions()).toBeTrue();
  });

  it('should allow user actions if role is ADMIN', () => {
    component.pageTitle.set('Usuários');
    component.currentUserRole.set('ADMIN');
    expect(component.disableUserActions()).toBeFalse();
  });
});
