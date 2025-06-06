import type { HttpInterceptorFn ,
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};import { Injectable, inject } from '@angular/core';
import {
  HttpErrorResponse
} from '@angular/common/http';
import type { Observable} from 'rxjs';
import { throwError, catchError } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    console.log('Interceptor: Token:', token);
    if (token && !req.url.includes('/auth/token')) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.log('Token abgelaufen oder ungültig. Logout wird ausgeführt.');
          this.authService.logout();
          location.reload(); 
        }
        return throwError(() => error);
      })
    );
  }
}
