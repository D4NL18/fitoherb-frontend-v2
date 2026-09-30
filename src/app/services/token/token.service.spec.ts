import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should extract email and role from JWT token and cookies', () => {
    // Header: {"alg":"HS256","typ":"JWT"} -> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    // Payload: {"sub":"admin@fitoherb.com","role":"ADMIN","name":"Daniel"} -> eyJzdWIiOiJhZG1pbkBmaXRvaGVyYi5jb20iLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiRGFuaWVsIn0
    // Signature: dummy -> abc123
    const fakeJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBmaXRvaGVyYi5jb20iLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiRGFuaWVsIn0.abc123';
    
    service.saveToken(fakeJwt, false);

    expect(service.getToken()).toBe(fakeJwt);
    expect(service.getUserEmail()).toBe('admin@fitoherb.com');
    expect(service.getUserRole()).toBe('ADMIN');
    expect(service.isAuthenticated()).toBeTrue();

    service.removeToken();
    expect(service.getToken()).toBeNull();
    expect(service.getUserEmail()).toBeNull();
    expect(service.getUserRole()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});

