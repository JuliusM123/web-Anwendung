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
  providedIn: 'root'
})
export class AuthService {
  #http = inject(HttpClient);
  private currentUserSource = new BehaviorSubject<User | null>(null);
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
      
      this.scheduleTokenRefresh(response.expires_in);

    } catch (error) {
      console.error('Fehler beim Verarbeiten der Tokens', error);
      this.logout();
    }
  }

  public logout(): void {
    localStorage.clear()
    clearTimeout(this.tokenRefreshTimer); // Wichtig: Timer stoppen!
    this.currentUserSource.next(null);
  }

  public refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return;
    }

    const url = 'https://localhost:3000/auth/refresh';
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    return this.#http.post<TokenResponse>(url, body.toString(), { headers }).pipe(
      tap(response => {
        console.log('Token erfolgreich erneuert!');
        this.loginSuccess(response);
      }),
      catchError(err => {
        console.error('Token-Erneuerung fehlgeschlagen', err);
        this.logout();
        return throwError(() => err as unknown);
      })
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
    const expirationDate = new Date().getTime() + response.expires_in * 1000;
    localStorage.setItem('authToken', response.access_token);
    localStorage.setItem('refreshToken', response.refresh_token);
    localStorage.setItem('authTokenExpiration', expirationDate.toString());
  }

  public getToken(): string | null { 
    return localStorage.getItem('authToken'); 
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
