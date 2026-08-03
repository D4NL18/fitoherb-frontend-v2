import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { TokenService } from '../../services/token/token.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthError } from '../../types/auth/AuthError.interface';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const tokenSpy = jasmine.createSpyObj('TokenService', ['isAuthenticated']);
    const navSpy = jasmine.createSpyObj('Router', ['navigate']);
    navSpy.navigate.and.returnValue(Promise.resolve(true));

    tokenSpy.isAuthenticated.and.returnValue(false); // default

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
        { provide: TokenService, useValue: tokenSpy },
        { provide: Router, useValue: navSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    tokenServiceSpy = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate empty fields on submit', () => {
    component.email = '';
    component.password = '';
    component.onSubmit();
    
    expect(component.errorStatus()).toBe(400);
    expect(component.modalResponseOpen()).toBeTrue();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should redirect to admin on successful login', () => {
    authServiceSpy.login.and.returnValue(of({} as any));
    component.email = 'test@example.com';
    component.password = '123456';
    component.rememberMe = false;
    component.onSubmit();
    
    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'test@example.com', password: '123456', rememberMe: false });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should show error on login failure', () => {
    const errorResponse = { status: 401, error: { message: 'Unauthorized' } as AuthError };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));
    component.email = 'test@example.com';
    component.password = 'wrong';
    component.onSubmit();
    
    expect(component.errorStatus()).toBe(401);
    expect(component.modalResponseOpen()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
  });
});
