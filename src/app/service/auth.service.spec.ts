import { TestBed } from '@angular/core/testing';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService, TokenResponse, User } from './auth.service';
import {
    provideHttpClient,
    withInterceptors,
    HttpClient,
} from '@angular/common/http';
import { authInterceptor } from '../interceptor/auth.intercepter';

const mockUser: User = {
    sub: '12345',
    name: 'admin',
    email: 'admin@acme.com',
    preferred_username: 'admin',
};

const mockJwtPayload = btoa(JSON.stringify(mockUser));
const MOCK_VALID_JWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${mockJwtPayload}.dummySignature`;

/**
 * Test suite für den `AuthService`.
 * Hier werden die Funktionen zur Benutzerauthentifizierung, Token-Verwaltung
 * und dem Refresh-Mechanismus getestet.
 */
describe('AuthService', () => {
    let httpTestingController: HttpTestingController;
    let httpClient: HttpClient;
    let authService: AuthService;
    let localStorageMock: { [key: string]: string };

    const mockTokenResponse: TokenResponse = {
        access_token: MOCK_VALID_JWT,
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        refresh_expires_in: 7200,
        token_type: 'Bearer',
    };

    /**
     * Vor jedem Test wird die Testumgebung eingerichtet.
     * Hier werden Spione für `localStorage` erstellt und der `AuthService`
     * sowie `HttpTestingController` initialisiert.
     */
    beforeEach(() => {
        localStorageMock = {};
        spyOn(localStorage, 'getItem').and.callFake(
            (key) => localStorageMock[key] || null,
        );
        spyOn(localStorage, 'setItem').and.callFake(
            (key, value) => (localStorageMock[key] = value),
        );
        spyOn(localStorage, 'clear').and.callFake(
            () => (localStorageMock = {}),
        );
        spyOn(console, 'error');

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
                AuthService,
            ],
        });

        authService = TestBed.inject(AuthService);
        httpTestingController = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
    });

    /**
     * Nach jedem Test wird überprüft, ob alle erwarteten HTTP-Anfragen behandelt wurden.
     */
    afterEach(() => {
        httpTestingController.verify();
    });

    /**
     * Testfall: Überprüft, ob der Dienst erfolgreich erstellt werden kann.
     */
    it('sollte erstellt werden', () => {
        expect(authService).toBeTruthy();
    });

    /**
     * Testfall: `loginSuccess` sollte Benutzerdaten aktualisieren und Tokens speichern.
     * Überprüft, ob `currentUser$` und `isLoggedIn$` korrekt aktualisiert werden
     * und die Tokens im `localStorage` gespeichert sind.
     */
    it('loginSuccess sollte Benutzerdaten aktualisieren und Tokens speichern', () => {
        authService.loginSuccess(mockTokenResponse);

        authService.currentUser$.subscribe((user) => {
            expect(user).toEqual(mockUser);
        });

        authService.isLoggedIn$.subscribe((isLoggedIn) => {
            expect(isLoggedIn).toBe(true);
        });

        expect(localStorage.getItem('access_token')).toBe(
            mockTokenResponse.access_token,
        );
        expect(localStorage.getItem('refreshToken')).toBe(
            mockTokenResponse.refresh_token,
        );
    });

    /**
     * Testfall: `logout` sollte Benutzerdaten und `localStorage` zurücksetzen.
     * Überprüft, ob `currentUser$` und `isLoggedIn$` zurückgesetzt werden
     * und `localStorage.clear` aufgerufen wurde.
     */
    it('logout sollte Benutzerdaten und localStorage zurücksetzen', () => {
        authService.loginSuccess(mockTokenResponse);
        authService.logout();

        authService.currentUser$.subscribe((user) => {
            expect(user).toBeUndefined();
        });

        authService.isLoggedIn$.subscribe((isLoggedIn) => {
            expect(isLoggedIn).toBe(false);
        });

        expect(localStorage.clear).toHaveBeenCalled();
    });

    /**
     * Testfall: `refreshToken` sollte bei Erfolg neue Tokens setzen.
     * Simuliert einen erfolgreichen Refresh-Token-Anruf und überprüft,
     * ob der Access Token aktualisiert und der `refreshCount` inkrementiert wird.
     */
    it('refreshToken sollte bei Erfolg neue Tokens setzen', () => {
        localStorage.setItem('refreshToken', 'initial-refresh-token');
        localStorage.setItem('refreshCount', '0');

        authService.refreshToken()?.subscribe();

        const req = httpTestingController.expectOne(
            'https://localhost:3000/auth/refresh',
        );
        expect(req.request.method).toBe('POST');
        expect(req.request.body.toString()).toContain(
            'grant_type=refresh_token',
        );

        req.flush(mockTokenResponse);

        expect(localStorage.getItem('access_token')).toBe(
            mockTokenResponse.access_token,
        );
        expect(localStorage.getItem('refreshCount')).toBe('1');
    });

    /**
     * Testfall: `refreshToken` sollte bei einem Fehler den Benutzer ausloggen.
     * Simuliert einen fehlgeschlagenen Refresh-Token-Anruf (z.B. 401 Unauthorized)
     * und überprüft, ob der Benutzer abgemeldet wird und der `localStorage` geleert wird.
     */
    it('refreshToken sollte bei einem Fehler den Benutzer ausloggen', () => {
        localStorage.setItem('refreshToken', 'initial-refresh-token');
        localStorage.setItem('refreshCount', '0');

        authService.refreshToken()?.subscribe({
            error: (err) => {
                expect(err).toBeTruthy();
            },
        });

        const req = httpTestingController.expectOne(
            'https://localhost:3000/auth/refresh',
        );
        req.flush(
            { message: 'Invalid token' },
            { status: 401, statusText: 'Unauthorized' },
        );

        authService.isLoggedIn$.subscribe((isLoggedIn) => {
            expect(isLoggedIn).toBe(false);
        });
        authService.currentUser$.subscribe((user) => {
            expect(user).toBeUndefined();
        });
        expect(localStorage.clear).toHaveBeenCalled();
    });
});
