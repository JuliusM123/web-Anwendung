import { TestBed } from '@angular/core/testing';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
    HttpClient,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { authInterceptor } from './auth.intercepter';

/**
 * Test-Suite für den `authInterceptor`.
 * Überprüft das Verhalten des Interceptors beim Hinzufügen des
 * `Authorization`-Headers zu HTTP-Anfragen.
 */
describe('authInterceptor', () => {
    let httpTestingController: HttpTestingController;
    let httpClient: HttpClient;
    let authService: AuthService;

    /** Ein Mock für den `AuthService` zur Simulation des Token-Verhaltens. */
    const mockAuthService = {
        getToken: () => 'mein-dummy-token-123',
    };

    /**
     * Vor jedem Test wird die Testumgebung konfiguriert.
     * Der `HttpClient` wird mit dem `authInterceptor` bereitgestellt
     * und der `AuthService` wird mit dem Mock überschrieben.
     */
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

    /**
     * Nach jedem Test wird überprüft, ob keine ausstehenden HTTP-Anfragen vorhanden sind.
     */
    afterEach(() => {
        httpTestingController.verify();
    });

    /**
     * Testfall: Der Interceptor sollte den `Authorization`-Header hinzufügen,
     * wenn ein Token vorhanden ist und die URL nicht den Pfad "/auth/" enthält.
     */
    it('sollte den Authorization-Header hinzufügen, wenn ein Token vorhanden ist und die URL nicht "/auth/" enthält', () => {
        const testUrl = '/api/data';
        const expectedToken = 'mein-dummy-token-123';

        httpClient.get(testUrl).subscribe();

        const req = httpTestingController.expectOne(testUrl);

        expect(req.request.headers.has('Authorization')).toBe(true);
        expect(req.request.headers.get('Authorization')).toBe(
            `Bearer ${expectedToken}`,
        );

        req.flush({});
    });

    /**
     * Testfall: Der Interceptor sollte den `Authorization`-Header NICHT hinzufügen,
     * wenn die URL den Pfad "/auth/" enthält (z.B. für Login- oder Refresh-Anfragen).
     */
    it('sollte den Authorization-Header NICHT hinzufügen, wenn die URL "/auth/" enthält', () => {
        const testUrl = 'https://localhost:3000/auth/token';

        httpClient.get(testUrl).subscribe();

        const req = httpTestingController.expectOne(testUrl);

        expect(req.request.headers.has('Authorization')).toBe(false);

        req.flush({});
    });

    /**
     * Testfall: Der Interceptor sollte den `Authorization`-Header NICHT hinzufügen,
     * wenn der `AuthService` keinen Token zurückgibt.
     */
    it('sollte den Authorization-Header NICHT hinzufügen, wenn kein Token vorhanden ist', () => {
        const testUrl = '/api/data';

        spyOn(authService, 'getToken').and.returnValue(null);

        httpClient.get(testUrl).subscribe();

        const req = httpTestingController.expectOne(testUrl);

        expect(req.request.headers.has('Authorization')).toBe(false);

        req.flush({});
    });
});
