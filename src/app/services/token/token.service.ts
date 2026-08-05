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

  saveToken(token: string, rememberMe: boolean = false): void {
    let cookieString = `${this.TOKEN_KEY}=${encodeURIComponent(token)}; path=/`;
    if (rememberMe) {
      // Set to expire in 7 days (604800 seconds)
      cookieString += '; max-age=604800';
    }
    document.cookie = cookieString;
  }

  getToken(): string | null {
    return this.getCookie(this.TOKEN_KEY);
  }

  removeToken(): void {
    document.cookie = `${this.TOKEN_KEY}=; Max-Age=0; path=/`;
    document.cookie = 'fitoherb_user_email=; Max-Age=0; path=/';
  }

  isAuthenticated(): boolean {
    return !!this.getToken() || !!this.getCookie('fitoherb_user_email');
  }

  getUserEmail(): string | null {
    return this.getCookie('fitoherb_user_email');
  }
}
