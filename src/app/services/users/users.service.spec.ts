import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UsersService } from './users.service';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../../types/page-response.interface';
import { UserRes } from '../../types/users/UserRes.interface';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ 
      providers: [provideHttpClient(), provideHttpClientTesting()] 
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch paginated users and update state', () => {
    const mockPage: PageResponse<UserRes> = { content: [], totalPages: 1, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true };
    
    service.getPaginated('test', 1, 'name', 'DESC');

    const req = httpMock.expectOne(req => req.url === `${environment.apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('test');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('sortField')).toBe('name');
    expect(req.request.params.get('direction')).toBe('DESC');
    
    req.flush(mockPage);

    expect(service.paginatedUsers()).toEqual(mockPage);
  });

  it('should get user by email', () => {
    const mockUser: any = { name: 'User', email: 'test@test.com', role: 'ADMIN', createdAt: '2023', lastLogin: '2023' };
    
    service.getByEmail('test@test.com').subscribe(res => {
      expect(res).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/test@test.com`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should update user', () => {
    const userReq: any = { name: 'User Updated', role: 'ADMIN' };

    service.update('test@test.com', userReq).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/test@test.com`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(userReq);
    req.flush({});
  });

  it('should update user password', () => {
    const pwdReq: any = { password: 'new-password' };

    service.updatePassword('test@test.com', pwdReq).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/update-password/test@test.com`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(pwdReq);
    req.flush({});
  });

  it('should delete user', () => {
    service.delete('test@test.com').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/test@test.com`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
