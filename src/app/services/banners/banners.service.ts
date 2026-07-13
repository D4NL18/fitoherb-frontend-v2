import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../../types/page-response.interface';
import { BannerRes } from '../../types/banners/BannerRes.interface';
import { BannerReq } from '../../types/banners/BannerReq.interface';

@Injectable({
  providedIn: 'root'
})
export class BannersService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/banners`;

  private activeBannersState = signal<BannerRes[]>([]);
  public activeBanners = this.activeBannersState.asReadonly();

  private isLoadingState = signal<boolean>(true);
  public isLoading = this.isLoadingState.asReadonly();

  private paginatedBannersState = signal<PageResponse<BannerRes> | null>(null);
  public paginatedBanners = this.paginatedBannersState.asReadonly();

  getActive() {
    this.isLoadingState.set(true);
    this.http.get<BannerRes[]>(`${this.API_URL}/active`).subscribe({
      next: (res) => {
        this.activeBannersState.set(res);
        this.isLoadingState.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar banners ativos', err);
        this.isLoadingState.set(false);
      },
    });
  }

  getPaginated(search: string = '', page: number = 0, sortField: string = 'position', direction: string = 'ASC') {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('sortField', sortField)
      .set('direction', direction);

    this.http.get<PageResponse<BannerRes>>(this.API_URL, { params }).subscribe({
      next: (res) => this.paginatedBannersState.set(res),
      error: (err) => console.error('Erro na paginação de banners', err),
    });
  }

  getById(id: string): Observable<BannerRes> {
    return this.http.get<BannerRes>(`${this.API_URL}/${id}`);
  }

  create(bannerReq: BannerReq, image: File): Observable<void> {
    const formData = this.buildFormData(bannerReq, image);
    return this.http.post<void>(this.API_URL, formData);
  }

  update(id: string, bannerReq: BannerReq, image: File | null): Observable<void> {
    const formData = this.buildFormData(bannerReq, image);
    return this.http.put<void>(`${this.API_URL}/${id}`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  private buildFormData(bannerReq: BannerReq, image: File | null): FormData {
    const formData = new FormData();
    const bannerBlob = new Blob([JSON.stringify(bannerReq)], { type: 'application/json' });
    
    formData.append('banner', bannerBlob);
    
    if (image) {
      formData.append('image', image);
    }
    
    return formData;
  }
}
