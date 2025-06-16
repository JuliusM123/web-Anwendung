import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService, TokenResponse, User } from './auth.service';

const mockUser: User = {
  sub: '12345',
  name: 'admin',
  email: 'admin@acme.com',
  preferred_username: 'admin',
};

const mockJwtPayload = btoa(JSON.stringify(mockUser));
const MOCK_VALID_JWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${mockJwtPayload}.dummySignature`;

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let localStorageMock: { [key: string]: string };

  const mockTokenResponse: TokenResponse = {
    access_token: MOCK_VALID_JWT,
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
    refresh_expires_in: 7200,
    token_type: 'Bearer',
  };

  beforeEach(() => {
    localStorageMock = {};
    spyOn(localStorage, 'getItem').and.callFake((key) => localStorageMock[key] || null);
    spyOn(localStorage, 'setItem').and.callFake(
      (key, value) => (localStorageMock[key] = value),
    );
    spyOn(localStorage, 'clear').and.callFake(() => (localStorageMock = {}));
    spyOn(console, 'error');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('sollte erstellt werden', () => {
    expect(service).toBeTruthy();
  });

  it('loginSuccess sollte Benutzerdaten aktualisieren und Tokens speichern', () => {
    service.loginSuccess(mockTokenResponse);

    service.currentUser$.subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    service.isLoggedIn$.subscribe((isLoggedIn) => {
      expect(isLoggedIn).toBe(true);
    });

    expect(localStorage.getItem('access_token')).toBe(mockTokenResponse.access_token);
    expect(localStorage.getItem('refreshToken')).toBe(mockTokenResponse.refresh_token);
  });

  it('logout sollte Benutzerdaten und localStorage zurücksetzen', () => {
    service.loginSuccess(mockTokenResponse);
    service.logout();

    service.currentUser$.subscribe((user) => {
      expect(user).toBeNull();
    });

    service.isLoggedIn$.subscribe((isLoggedIn) => {
      expect(isLoggedIn).toBe(false);
    });

    expect(localStorage.clear).toHaveBeenCalled();
  });

  it('refreshToken sollte bei Erfolg neue Tokens setzen', () => {
    localStorage.setItem('refreshToken', 'initial-refresh-token');
    localStorage.setItem('refreshCount', '0');

    service.refreshToken()?.subscribe();

    const req = httpTestingController.expectOne('https://localhost:3000/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.toString()).toContain('grant_type=refresh_token');

    req.flush(mockTokenResponse);

    expect(localStorage.getItem('access_token')).toBe(mockTokenResponse.access_token);
    expect(localStorage.getItem('refreshCount')).toBe('1');
  });

  it('refreshToken sollte bei einem Fehler den Benutzer ausloggen', () => {
    localStorage.setItem('refreshToken', 'initial-refresh-token');
    localStorage.setItem('refreshCount', '0');

    service.refreshToken()?.subscribe({
      error: (err) => {
        expect(err).toBeTruthy();
      },
    });

    const req = httpTestingController.expectOne('https://localhost:3000/auth/refresh');
    req.flush({ message: 'Invalid token' }, { status: 401, statusText: 'Unauthorized' });

    service.isLoggedIn$.subscribe((isLoggedIn) => {
      expect(isLoggedIn).toBe(false);
    });
    service.currentUser$.subscribe((user) => {
      expect(user).toBeNull();
    });
    expect(localStorage.clear).toHaveBeenCalled();
  });
});