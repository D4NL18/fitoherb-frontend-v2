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

  private decodeTokenPayload(token: string): { sub?: string; role?: 'ADMIN' | 'USER' | 'SELLER'; name?: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
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

    const payload = this.decodeTokenPayload(token);
    if (payload?.sub) {
      let emailCookie = `fitoherb_user_email=${encodeURIComponent(payload.sub)}; path=/; SameSite=Strict`;
      if (rememberMe) {
        const d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        emailCookie += `; expires=${d.toUTCString()}`;
      }
      document.cookie = emailCookie;
    }

    if (payload?.role) {
      let roleCookie = `fitoherb_user_role=${encodeURIComponent(payload.role)}; path=/; SameSite=Strict`;
      if (rememberMe) {
        const d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        roleCookie += `; expires=${d.toUTCString()}`;
      }
      document.cookie = roleCookie;
    }
  }

  getToken(): string | null {
    return this.getCookie(this.TOKEN_KEY);
  }

  removeToken(): void {
    document.cookie = `${this.TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = 'fitoherb_user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'fitoherb_user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'fitoherb_remember=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  isAuthenticated(): boolean {
    return !!this.getToken() || !!this.getCookie('fitoherb_user_email');
  }

  getUserEmail(): string | null {
    const cookieEmail = this.getCookie('fitoherb_user_email');
    if (cookieEmail) return cookieEmail;

    const token = this.getToken();
    if (token) {
      const payload = this.decodeTokenPayload(token);
      return payload?.sub || null;
    }
    return null;
  }

  getUserRole(): 'ADMIN' | 'USER' | 'SELLER' | null {
    const cookieRole = this.getCookie('fitoherb_user_role') as 'ADMIN' | 'USER' | 'SELLER' | null;
    if (cookieRole) return cookieRole;

    const token = this.getToken();
    if (token) {
      const payload = this.decodeTokenPayload(token);
      return payload?.role || null;
    }
    return null;
  }
}
