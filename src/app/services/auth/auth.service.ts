import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TokenService } from '../token/token.service';
import { environment } from '../../../environments/environment.development';
import { LoginRes } from '../../types/auth/LoginRes.interface';
import { tap } from 'rxjs';
import { LoginReq } from '../../types/auth/LoginReq.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private readonly apiUrl = environment.apiUrl;

  login(loginData: LoginReq) {
    return this.http.post<LoginRes>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        tap(res => this.tokenService.saveToken(res.token))
      );
  }

  logout() {
    this.tokenService.removeToken();
  }
}
