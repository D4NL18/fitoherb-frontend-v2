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

  const addTokenHeader = (request: HttpRequest<any>, token: string) => {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  };

  const token = tokenService.getToken();
  let authReq = req;

  if (token && !req.url.includes('/refresh')) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/refresh')) {

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((response: any) => {
              isRefreshing = false;
              tokenService.saveToken(response.token);
              refreshTokenSubject.next(response.token);

              return next(addTokenHeader(req, response.token));
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              tokenService.removeToken();
              router.navigate(['/login']);
              return throwError(() => refreshErr);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(jwt => next(addTokenHeader(req, jwt as string)))
          );
        }
      }

      return throwError(() => error);
    })
  );
};