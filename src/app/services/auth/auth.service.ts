import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

import { TokenService } from '../token/token.service';
import { LoginRes } from '../../types/auth/LoginRes.interface';
import { LoginReq } from '../../types/auth/LoginReq.interface';
import { RegisterReq } from '../../types/auth/RegisterReq.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private readonly apiUrl = environment.apiUrl;

  login(loginData: LoginReq): Observable<LoginRes> {
    return this.http.post<LoginRes>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        tap(res => this.tokenService.saveToken(res.token))
      );
  }

  register(registerData: RegisterReq): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/register`, registerData);
  }

  refreshToken(): Observable<LoginRes> {
    return this.http.post<LoginRes>(`${this.apiUrl}/auth/refresh`, {});
  }

  logout() {
    this.tokenService.removeToken();
  }
}