import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { TokenService } from '../../services/token/token.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Send cookies with all requests
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/refresh') && !req.url.includes('/login')) {

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              // Token and email are set via cookies by the backend
              refreshTokenSubject.next('refreshed');

              // Retry the request that failed (it will now have the new cookies)
              return next(authReq);
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              tokenService.removeToken();
              if (router.url.startsWith('/admin')) {
                router.navigate(['/login']);
              }
              return throwError(() => refreshErr);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(status => status !== null),
            take(1),
            switchMap(() => next(authReq))
          );
        }
      }

      return throwError(() => error);
    })
  );
};
