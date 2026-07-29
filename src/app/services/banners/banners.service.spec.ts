import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { BannersService } from './banners.service';
import { environment } from '../../../environments/environment';

describe('BannersService', () => {
  let service: BannersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ 
      providers: [provideHttpClient(), provideHttpClientTesting()] 
    });
    service = TestBed.inject(BannersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch active banners and update state', () => {
    const mockBanners: any[] = [{ id: '1', title: 'Banner 1', imagePath: 'url1', position: 1, active: true, createdAt: '2023' }];
    
    expect(service.isLoading()).toBeTrue();
    service.getActive();

    const req = httpMock.expectOne(`${environment.apiUrl}/banners/active`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBanners);

    expect(service.activeBanners()).toEqual(mockBanners);
    expect(service.isLoading()).toBeFalse();
  });

  it('should fetch paginated banners and update state', () => {
    const mockPage = { content: [], totalPages: 1, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true };
    
    service.getPaginated('test', 1, 'name', 'DESC');

    const req = httpMock.expectOne(req => req.url === `${environment.apiUrl}/banners`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('test');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('sortField')).toBe('name');
    expect(req.request.params.get('direction')).toBe('DESC');
    
    req.flush(mockPage);

    expect(service.paginatedBanners()).toEqual(mockPage);
  });

  it('should get banner by id', () => {
    const mockBanner: any = { id: '1', title: 'Banner 1', imagePath: 'url', position: 1, active: true, createdAt: '2023' };
    
    service.getById('1').subscribe(res => {
      expect(res).toEqual(mockBanner);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/banners/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBanner);
  });

  it('should create banner', () => {
    const bannerReq: any = { title: 'Banner 1', position: 1, active: true };
    const mockFile = new File([''], 'test.png', { type: 'image/png' });

    service.create(bannerReq, mockFile).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/banners`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.has('banner')).toBeTrue();
    expect(req.request.body.has('image')).toBeTrue();
    req.flush({});
  });

  it('should update banner', () => {
    const bannerReq: any = { title: 'Banner 1', position: 1, active: true };
    const mockFile = new File([''], 'test.png', { type: 'image/png' });

    service.update('1', bannerReq, mockFile).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/banners/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.has('banner')).toBeTrue();
    expect(req.request.body.has('image')).toBeTrue();
    req.flush({});
  });

  it('should delete banner', () => {
    service.delete('1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/banners/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
