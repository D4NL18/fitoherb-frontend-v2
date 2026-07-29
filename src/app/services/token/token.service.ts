import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
    return null;
  }

  saveToken(token: string): void {
    // Kept for backward compatibility if needed, but handled by backend cookies now
  }

  getToken(): string | null {
    // The JWT is HttpOnly, we can't access it here.
    return null;
  }

  removeToken(): void {
    // To cleanly clear the frontend state immediately if needed, we can clear the email cookie
    // The backend /auth/logout will clear the HttpOnly one.
    document.cookie = 'fitoherb_user_email=; Max-Age=0; path=/';
  }

  isAuthenticated(): boolean {
    return !!this.getCookie('fitoherb_user_email');
  }

  getUserEmail(): string | null {
    return this.getCookie('fitoherb_user_email');
  }
}
