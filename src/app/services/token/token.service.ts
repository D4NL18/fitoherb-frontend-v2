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

  saveToken(token: string, rememberMe?: boolean): void {
    // Se rememberMe não for passado, tenta ler do cookie anterior
    if (rememberMe === undefined) {
      rememberMe = this.getCookie('fitoherb_remember') === 'true';
    } else {
      // Salva a preferência
      let remCookie = `fitoherb_remember=${rememberMe}; path=/; SameSite=Strict`;
      if (rememberMe) {
        const d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        remCookie += `; expires=${d.toUTCString()}`;
      }
      document.cookie = remCookie;
    }

    let cookieString = `${this.TOKEN_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Strict`;
    if (rememberMe) {
      const d = new Date();
      d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${d.toUTCString()}`;
    }
    document.cookie = cookieString;
  }

  getToken(): string | null {
    return this.getCookie(this.TOKEN_KEY);
  }

  removeToken(): void {
    document.cookie = `${this.TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = 'fitoherb_user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'fitoherb_remember=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  isAuthenticated(): boolean {
    return !!this.getToken() || !!this.getCookie('fitoherb_user_email');
  }

  getUserEmail(): string | null {
    return this.getCookie('fitoherb_user_email');
  }
}
