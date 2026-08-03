import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly TOKEN_KEY = 'fitoherb_token';

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
    return null;
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    document.cookie = 'fitoherb_user_email=; Max-Age=0; path=/';
  }

  isAuthenticated(): boolean {
    return !!this.getToken() || !!this.getCookie('fitoherb_user_email');
  }

  getUserEmail(): string | null {
    return this.getCookie('fitoherb_user_email');
  }
}
