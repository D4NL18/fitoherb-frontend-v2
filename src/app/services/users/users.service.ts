import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../../types/page-response.interface';
import { UserRes } from '../../types/users/UserRes.interface';
import { UserReq } from '../../types/users/UserReq.interface';
import { PasswordUpdateReq } from '../../types/users/PasswordUpdateReq.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  private userPageState = signal<PageResponse<UserRes> | null>(null);
  public paginatedUsers = this.userPageState.asReadonly();

  getPaginated(search: string = '', page: number = 0, sortField: string = 'name', direction: string = 'ASC') {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('sortField', sortField)
      .set('direction', direction);

    this.http.get<PageResponse<UserRes>>(this.API_URL, { params }).subscribe({
      next: (res) => this.userPageState.set(res),
      error: (err) => console.error('Erro ao carregar usuários', err),
    });
  }

  getByEmail(email: string): Observable<UserRes> {
    return this.http.get<UserRes>(`${this.API_URL}/${email}`);
  }
  update(email: string, userReq: UserReq): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${email}`, userReq);
  }

  updatePassword(email: string, passwordData: PasswordUpdateReq): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/update-password/${email}`, passwordData);
  }

  delete(email: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${email}`);
  }
}
