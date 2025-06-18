import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';

/**
 * Schnittstelle für die Token-Antwort vom Authentifizierungsserver.
 * Enthält den Zugriffs- und Refresh-Token sowie deren Gültigkeitsdauern.
 */
export interface TokenResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
}

/**
 * Schnittstelle für die Benutzerdaten, die im JWT-Payload enthalten sind.
 */
export interface User {
    sub: string;
    name: string;
    email: string;
    preferred_username: string;
}

/**
 * `AuthService` ist für die gesamte Authentifizierungslogik in der Anwendung verantwortlich.
 * Dies umfasst das Anmelden, Abmelden, die Verwaltung von Zugriffs- und Refresh-Tokens
 * sowie die Bereitstellung des aktuellen Benutzerstatus.
 */
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    /** Der HTTP-Client für die Kommunikation mit dem Backend. */
    #http = inject(HttpClient);
    /** Ein `BehaviorSubject`, das den aktuellen angemeldeten Benutzer speichert oder `null`, wenn niemand angemeldet ist. */
    private currentUserSource = new BehaviorSubject<User | null>(null);
    /** Ein `BehaviorSubject`, das den Anmeldestatus des Benutzers verfolgt. */
    private loggedin = new BehaviorSubject<boolean>(
        !!localStorage.getItem('access_token'),
    );
    /** Ein Observable, das den Anmeldestatus des Benutzers bereitstellt. */
    public isLoggedIn$ = this.loggedin.asObservable();
    /** Ein Observable, das die Daten des aktuell angemeldeten Benutzers bereitstellt. */
    public currentUser$ = this.currentUserSource.asObservable();

    /** Der Timer, der für die automatische Erneuerung des Tokens verwendet wird. */
    private tokenRefreshTimer: ReturnType<typeof setTimeout> | undefined;

    /**
     * Konstruktor des `AuthService`.
     * Beim Initialisieren des Dienstes wird versucht, den initialen Anmeldestatus
     * aus dem `localStorage` zu laden.
     */
    constructor() {
        this.loadInitialState();
    }

    /**
     * Wird nach einer erfolgreichen Anmeldung aufgerufen.
     * Speichert die erhaltenen Tokens, dekodiert die Benutzerdaten aus dem Access Token,
     * aktualisiert den Anmeldestatus und plant die automatische Token-Erneuerung.
     * @param response Die `TokenResponse` vom Authentifizierungsserver.
     */
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

    /**
     * Meldet den Benutzer ab.
     * Leert den `localStorage`, stoppt den Token-Refresh-Timer und setzt
     * den Benutzer- und Anmeldestatus zurück.
     */
    public logout(): void {
        localStorage.clear();
        clearTimeout(this.tokenRefreshTimer);
        this.currentUserSource.next(null);
        this.loggedin.next(false);
    }

    /**
     * Fordert einen neuen Access Token mithilfe des Refresh Tokens an.
     * Wenn kein Refresh Token vorhanden ist oder eine maximale Anzahl von Refresh-Versuchen
     * erreicht wurde, wird der Benutzer abgemeldet.
     * Bei Erfolg werden die neuen Tokens gespeichert und der Refresh-Zähler aktualisiert.
     * Bei einem Fehler wird der Benutzer ebenfalls abgemeldet.
     * @returns Ein Observable der `TokenResponse` oder `undefined`, wenn kein Refresh Token verfügbar ist.
     */
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

    /**
     * Lädt den initialen Anmeldestatus beim Start des Dienstes.
     * Überprüft, ob gültige Tokens im `localStorage` vorhanden sind
     * und versucht gegebenenfalls, den Token zu erneuern, wenn er abgelaufen ist.
     */
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

    /**
     * Plant die automatische Erneuerung des Tokens.
     * Der Token wird kurz vor seinem Ablauf erneuert, um eine nahtlose Sitzung zu gewährleisten.
     * @param expiresInSeconds Die Gültigkeitsdauer des Tokens in Sekunden.
     */
    private scheduleTokenRefresh(expiresInSeconds: number) {
        clearTimeout(this.tokenRefreshTimer);
        // Erneuere 60 Sekunden, bevor der Token abläuft
        const timeout = (expiresInSeconds - 60) * 1000;

        this.tokenRefreshTimer = setTimeout(() => {
            console.log('Token läuft bald ab, starte Erneuerung...');
            this.refreshToken()?.subscribe();
        }, timeout);
    }

    /**
     * Speichert die erhaltenen Tokens und Benutzerdaten im `localStorage`.
     * @param response Die `TokenResponse`, die die Access- und Refresh-Tokens enthält.
     */
    private saveTokens(response: TokenResponse): void {
        const expirationDate =
            new Date().getTime() + response.expires_in * 1000;
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);
        localStorage.setItem('authTokenExpiration', expirationDate.toString());

        const user = jwtDecode<User>(response.access_token);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    /**
     * Ruft den Access Token aus dem `localStorage` ab.
     * @returns Der Access Token als String oder `null`, wenn nicht vorhanden.
     */
    public getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    /**
     * Ruft den Refresh Token aus dem `localStorage` ab.
     * @returns Der Refresh Token als String oder `null`, wenn nicht vorhanden.
     */
    public getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    /**
     * Überprüft, ob ein Benutzer aktuell angemeldet ist, basierend auf dem Vorhandensein eines Access Tokens.
     * @returns `true`, wenn ein Access Token vorhanden ist, ansonsten `false`.
     */
    public isLoggedIn(): boolean {
        return !!this.getToken();
    }
}

/**
 * Dekodiert einen JWT (JSON Web Token) und gibt dessen Payload als Typ `T` zurück.
 * @param access_token Der zu dekodierende JWT.
 * @returns Der dekodierte Payload des JWTs als Typ `T`.
 */
function jwtDecode<T>(access_token: string): T {
    const payload = access_token.split('.')[1];
    // Ersetzt URL-sichere Base64-Zeichen zurück zu Standard Base64
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as T;
}