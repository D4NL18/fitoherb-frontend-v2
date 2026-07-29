import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TokenService', ['saveToken', 'removeToken']);

    TestBed.configureTestingModule({ 
      providers: [
        provideHttpClient(), 
        provideHttpClientTesting(),
        { provide: TokenService, useValue: spy }
      ] 
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenServiceSpy = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call login API and save token on success', () => {
    const loginData = { email: 'test@test.com', password: 'password123' };
    const mockRes = { token: 'mock-jwt-token' };

    service.login(loginData).subscribe(res => {
      expect(res).toEqual(mockRes);
      expect(tokenServiceSpy.saveToken).toHaveBeenCalledWith(mockRes.token);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);
    req.flush(mockRes);
  });

  it('should call register API', () => {
    const registerData: any = { name: 'Test', email: 'test@test.com', password: 'password123', role: 'ADMIN' };

    service.register(registerData).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerData);
    req.flush({});
  });

  it('should call refresh API', () => {
    const mockRes = { token: 'new-mock-jwt-token' };

    service.refreshToken().subscribe(res => {
      expect(res).toEqual(mockRes);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);
  });

  it('should remove token on logout', () => {
    service.logout();
    expect(tokenServiceSpy.removeToken).toHaveBeenCalled();
  });
});
