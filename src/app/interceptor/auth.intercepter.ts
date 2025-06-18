import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

/**
 * Ein HTTP-Interceptor, der den `Authorization`-Header zu ausgehenden Anfragen hinzufügt.
 *
 * Dieser Interceptor hat folgende Logik:
 * 1. Ruft den Authentifizierungsdienst auf, um den aktuellen Token zu erhalten.
 * 2. Wenn ein Token vorhanden ist UND die Anforderungs-URL NICHT den Pfad `/auth/` enthält
 * (um zu vermeiden, dass Authentifizierungs-Endpunkte selbst mit einem Token versehen werden),
 * wird der `Authorization`-Header mit dem Format `Bearer [Token]` gesetzt.
 * 3. Die modifizierte oder ursprüngliche Anfrage wird an den nächsten Handler in der Kette weitergeleitet.
 */
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
