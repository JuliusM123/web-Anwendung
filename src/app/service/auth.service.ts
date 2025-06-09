import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';

export interface TokenResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
}

export interface User {
    sub: string;
    name: string;
    email: string;
    preferred_username: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    #http = inject(HttpClient);
    private currentUserSource = new BehaviorSubject<User | null>(null);
    private loggedin = new BehaviorSubject<boolean>(
        !!localStorage.getItem('access_token'),
    );
    public isLoggedIn$ = this.loggedin.asObservable();
    public currentUser$ = this.currentUserSource.asObservable();

    private tokenRefreshTimer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        this.loadInitialState();
    }

    public loginSuccess(response: TokenResponse): void {
        try {
            const user = jwtDecode<User>(response.access_token);
            this.saveTokens(response);
            this.currentUserSource.next(user);
            this.loggedin.next(true);

            this.scheduleTokenRefresh(response.expires_in);
        } catch (error) {
            console.error('Fehler beim Verarbeiten der Tokens', error);
            this.logout();
        }
    }

    public logout(): void {
        localStorage.clear();
        clearTimeout(this.tokenRefreshTimer);
        this.currentUserSource.next(null);
        this.loggedin.next(false);
    }

    public refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.logout();
            return;
        }

        const refreshCount = parseInt(
            localStorage.getItem('refreshCount') ?? '0',
            10,
        );
        if (refreshCount >= 10) {
            this.logout();
            return;
        }

        const url = 'https://localhost:3000/auth/refresh';
        const body = new URLSearchParams();
        body.set('grant_type', 'refresh_token');
        body.set('refresh_token', refreshToken);

        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

        return this.#http
            .post<TokenResponse>(url, body.toString(), { headers })
            .pipe(
                tap((response) => {
                    console.log('Token erfolgreich erneuert!');
                    const newCount = refreshCount + 1;
                    localStorage.setItem('refreshCount', newCount.toString());
                    console.log('Refresh-Zähler aktualisiert:', newCount);
                    this.loginSuccess(response);
                }),
                catchError((err) => {
                    console.error('Token-Erneuerung fehlgeschlagen', err);
                    this.logout();
                    return throwError(() => err as unknown);
                }),
            );
    }

    private loadInitialState(): void {
        const token = this.getToken();
        const expiration = localStorage.getItem('authTokenExpiration');
        if (!token || !expiration) {
            return;
        }

        const expiresIn = +expiration - new Date().getTime();
        if (expiresIn > 0) {
            const userData = localStorage.getItem('userData');
            if (userData) {
                this.currentUserSource.next(JSON.parse(userData) as User);
                this.loggedin.next(true);
                this.scheduleTokenRefresh(expiresIn / 1000);
            }
        } else {
            this.refreshToken()?.subscribe();
        }
    }

    private scheduleTokenRefresh(expiresInSeconds: number) {
        clearTimeout(this.tokenRefreshTimer);
        const timeout = (expiresInSeconds - 60) * 1000;

        this.tokenRefreshTimer = setTimeout(() => {
            console.log('Token läuft bald ab, starte Erneuerung...');
            this.refreshToken()?.subscribe();
        }, timeout);
    }

    private saveTokens(response: TokenResponse): void {
        const expirationDate =
            new Date().getTime() + response.expires_in * 1000;
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);
        localStorage.setItem('authTokenExpiration', expirationDate.toString());

        const user = jwtDecode<User>(response.access_token);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    public getToken(): string | null {
        return localStorage.getItem('access_token');
    }
    public getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }
    public isLoggedIn(): boolean {
        return !!this.getToken();
    }
}

function jwtDecode<T>(access_token: string): T {
    const payload = access_token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as T;
}
