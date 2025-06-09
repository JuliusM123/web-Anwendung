import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { authInterceptor } from './auth.intercepter';

describe('authInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthService;

  const mockAuthService = {
    getToken: () => 'mein-dummy-token-123', 
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('sollte den Authorization-Header hinzufügen, wenn ein Token vorhanden ist und die URL nicht "/auth/" enthält', () => {
    const testUrl = '/api/data';
    const expectedToken = 'mein-dummy-token-123';

    httpClient.get(testUrl).subscribe();

    const req = httpTestingController.expectOne(testUrl);

    // Überprüfe, ob der Header korrekt gesetzt wurde
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${expectedToken}`
    );

    req.flush({});
  });

  it('sollte den Authorization-Header NICHT hinzufügen, wenn die URL "/auth/" enthält', () => {
    const testUrl = 'https://localhost:3000/auth/token';

    httpClient.get(testUrl).subscribe();

    const req = httpTestingController.expectOne(testUrl);

    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({});
  });

  it('sollte den Authorization-Header NICHT hinzufügen, wenn kein Token vorhanden ist', () => {
    const testUrl = '/api/data';
    
    spyOn(authService, 'getToken').and.returnValue(null);

    httpClient.get(testUrl).subscribe();

    const req = httpTestingController.expectOne(testUrl);

    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({});
  });
});