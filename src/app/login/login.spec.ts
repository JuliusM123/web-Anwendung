import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
    provideHttpClientTesting,
    HttpTestingController,
} from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login';
import { AuthService, TokenResponse } from '../service/auth.service';
import { provideHttpClient } from '@angular/common/http';

/**
 * @class Beschreibung der Tests für die LoginComponent.
 */
describe('LoginComponent', () => {
    let httpTestingController: HttpTestingController;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;
    let component: LoginComponent;
    let fixture: any;
    const mockTokenResponse: TokenResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        refresh_expires_in: 7200,
        token_type: 'Bearer',
    };

    /**
     * @function beforeEach
     *
     * Initialisiert die Testumgebung vor jedem Testlauf.
     */
    beforeEach(() => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const authServiceSpy = jasmine.createSpyObj('AuthService', [
            'loginSuccess',
        ]);
        TestBed.configureTestingModule({
            imports: [LoginComponent, FormsModule],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        httpTestingController = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(
            AuthService,
        ) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture.detectChanges();
    });

    /**
     * @function afterEach
     *
     * Überprüft, dass nach jedem Test keine HTTP-Anfragen offen sind.
     */
    afterEach(() => {
        httpTestingController.verify();
    });

    /**
     * @function should create
     *
     * Test: Überprüft, ob die Komponente erfolgreich erstellt wurde.
     */
    it('sollte erstellt werden', () => {
        expect(component).toBeTruthy();
    });

    /**
     * @function should call authService.loginSuccess and navigate on successful login
     *
     * Test: Überprüft, ob bei erfolgreichem Login die Methode authService.loginSuccess aufgerufen
     * und zur Route "/home" navigiert wird.
     */
    it('sollte authService.loginSuccess aufrufen und bei erfolgreichem Login navigieren', fakeAsync(() => {
        component.username = 'admin';
        component.password = 'pw';
        component.login();
        tick();
        const req = httpTestingController.expectOne(
            'https://localhost:3000/auth/token',
        );
        expect(req.request.method).toBe('POST');
        req.flush(mockTokenResponse);
        tick();
        expect(authService.loginSuccess).toHaveBeenCalledWith(
            mockTokenResponse,
        );
        tick(1000);
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    }));

    /**
     * @function should set error message on 401 error
     *
     * Test: Überprüft, ob bei einem 401-Fehler (Unauthorized) die Fehlermeldung
     * "Benutzername oder Passwort ist falsch." gesetzt wird.
     */
    it('sollte bei 401-Fehler die korrekte Fehlermeldung setzen', fakeAsync(() => {
        component.username = 'wrong';
        component.password = 'credentials';
        component.login();
        tick();
        const req = httpTestingController.expectOne(
            'https://localhost:3000/auth/token',
        );
        req.flush(
            { message: 'Unauthorized' },
            { status: 401, statusText: 'Unauthorized' },
        );
        tick();
        fixture.detectChanges();
        expect(component.loginErrorMessage).toBe(
            'Benutzername oder Passwort ist falsch.',
        );
    }));

    /**
     * @function should set generic error message on server error
     *
     * Test: Überprüft, ob bei einem Serverfehler (Status 500) die generische
     * Fehlermeldung "Ein unerwarteter Fehler ist aufgetreten." gesetzt wird.
     */
    it('sollte bei Serverfehler eine generische Fehlermeldung setzen', fakeAsync(() => {
        component.username = 'admin';
        component.password = 'pw';
        component.login();
        tick();
        const req = httpTestingController.expectOne(
            'https://localhost:3000/auth/token',
        );
        req.flush(
            { message: 'Server Error' },
            { status: 500, statusText: 'Internal Server Error' },
        );
        tick();
        fixture.detectChanges();
        expect(component.loginErrorMessage).toBe(
            'Ein unerwarteter Fehler ist aufgetreten.',
        );    }));
});
