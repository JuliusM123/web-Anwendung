import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const authToken = authService.getToken();
    if (authToken && !req.url.includes('/auth/')) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return next(authReq);
    }
    return next(req);
};
