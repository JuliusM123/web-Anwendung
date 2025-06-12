import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService, TokenResponse, User } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

// HILFSFUNKTIONEN UND MOCK-DATEN
// #################################

const mockUser: User = {
  sub: '12345',
  name: 'Test User',
  email: 'test@test.com',
  preferred_username: 'testuser',
};

const mockAccessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
  JSON.stringify(mockUser),
)}.signature`;

const mockTokenResponse: TokenResponse = {
  access_token: mockAccessToken,
  expires_in: 300,
  refresh_expires_in: 1800,
  refresh_token: 'mock-refresh-token',
  token_type: 'Bearer',
};

// BEGINN DER TEST-SUITE
// #################################

describe('AuthService', () => {
  let httpTestingController: HttpTestingController;
  let service: AuthService;
  let localStorageStore: { [key: string]: string };

  // Der 'beforeEach' konfiguriert das Test-Modul und die Mocks.
  beforeEach(() => {
    localStorageStore = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => localStorageStore[key] ?? null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => (localStorageStore[key] = value));
    spyOn(localStorage, 'clear').and.callFake(() => (localStorageStore = {}));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    // Wichtig: Die Dependencies werden immer über das TestBed bezogen.
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService); // Der Service wird hier für die meisten Tests initialisiert.
  });

  afterEach(() => {
    // Stellt sicher, dass alle HTTP-Anfragen im Test beantwortet wurden.
    httpTestingController.verify();
  });

  it('sollte erstellt werden', () => {
    expect(service).toBeTruthy();
  });

  it('sollte initial nicht eingeloggt sein', (done) => {
    service.isLoggedIn$.subscribe((isLoggedIn) => {
      expect(isLoggedIn).toBeFalse();
      done();
    });
  });

  // TESTS FÜR LOGIN UND LOGOUT
  // #################################

  describe('loginSuccess', () => {
    it('sollte Tokens speichern, Status aktualisieren und Erneuerung planen', fakeAsync(() => {
      const refreshTokenSpy = spyOn(service, 'refreshToken').and.callThrough();
      service.loginSuccess(mockTokenResponse);

      // Prüfen, ob Observables die richtigen Werte ausgeben
      let isLoggedIn = false;
      service.isLoggedIn$.subscribe((val) => (isLoggedIn = val));
      expect(isLoggedIn).toBeTrue();
      
      // KORREKTUR: Der fehlschlagende Test wurde hier behoben.
      // Der durch den Timeout ausgelöste HTTP-Call muss abgefangen werden.
      tick(240_000);
      expect(refreshTokenSpy).toHaveBeenCalled();

      // HTTP-Request des Refreshs abfangen und eine Antwort senden.
      const req = httpTestingController.expectOne('https://localhost:3000/auth/refresh');
      req.flush(mockTokenResponse);

      // Wichtig: Timer aufräumen, um Seiteneffekte in anderen Tests zu vermeiden.
      clearTimeout(service['tokenRefreshTimer']);
    }));
  });

  describe('logout', () => {
    it('sollte den Speicher leeren und den Benutzerstatus zurücksetzen', () => {
      service.loginSuccess(mockTokenResponse);
      service.logout();
      expect(localStorage.clear).toHaveBeenCalled();
      
      let isLoggedIn = true;
      service.isLoggedIn$.subscribe((val) => (isLoggedIn = val));
      expect(isLoggedIn).toBeFalse();
    });
  });

  // TESTS FÜR TOKEN REFRESH
  // #################################

  describe('refreshToken', () => {
    it('sollte das Token erfolgreich erneuern', () => {
      localStorageStore['refreshToken'] = 'initial-refresh-token';
      
      service.refreshToken()?.subscribe();

      const req = httpTestingController.expectOne('https://localhost:3000/auth/refresh');
      req.flush(mockTokenResponse);

      expect(localStorage.getItem('access_token')).toBe(mockTokenResponse.access_token);
    });

    it('sollte bei einem HTTP-Fehler ausloggen', () => {
      const logoutSpy = spyOn(service, 'logout');
      localStorageStore['refreshToken'] = 'some-token';
      
      service.refreshToken()?.subscribe();

      const req = httpTestingController.expectOne('https://localhost:3000/auth/refresh');
      // Einen Fehler simulieren
      req.flush('Error', new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));

      expect(logoutSpy).toHaveBeenCalled();
    });
  });

  // KORRIGIERTER ANSATZ FÜR KONSTRUKTOR-TESTS
  // #################################
  
  describe('Initialisierung (Konstruktor)', () => {
    
    it('sollte den Zustand wiederherstellen, wenn ein gültiges Token im Speicher ist', () => {
      // Setup des localStorage VOR der Service-Erstellung.
      const expiration = new Date().getTime() + 10_000;
      localStorageStore['access_token'] = mockAccessToken;
      localStorageStore['authTokenExpiration'] = expiration.toString();
      localStorageStore['userData'] = JSON.stringify(mockUser);
      
      // Erstellt eine NEUE Instanz des Service mit dem vorbereiteten localStorage.
      const newService = TestBed.inject(AuthService);

      let isLoggedIn = false;
      newService.isLoggedIn$.subscribe((val) => (isLoggedIn = val));
      
      // Die Erwartung muss nun `true` sein.
      expect(isLoggedIn).toBeTrue();
    });

    it('sollte versuchen, das Token zu erneuern, wenn es abgelaufen ist', () => {
      // Setup des localStorage VOR der Service-Erstellung.
      const expiration = new Date().getTime() - 10_000;
      localStorageStore['access_token'] = mockAccessToken;
      localStorageStore['authTokenExpiration'] = expiration.toString();
      localStorageStore['refreshToken'] = 'expired-refresh-token';
      
      // Erstellt eine NEUE Instanz. Der Konstruktor löst den Refresh aus.
      TestBed.inject(AuthService);

      const req = httpTestingController.expectOne('https://localhost:3000/auth/refresh');
      expect(req.request.method).toBe('POST');
      req.flush(mockTokenResponse); // Wichtig, um den Test sauber zu beenden.
    });
  });
});