import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly TOKEN_KEY = 'fitoherb_token';

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payloadBase64Url = token.split('.')[1];
      
      const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      const payloadJson = decodeURIComponent(window.atob(payloadBase64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(payloadJson);
      
      return payload.sub || payload.email || null;
      
    } catch (e) {
      console.error('Erro ao decodificar o token', e);
      return null;
    }
  }
}
