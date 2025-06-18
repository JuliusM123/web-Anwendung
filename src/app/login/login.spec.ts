import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { LoginComponent } from './login';
import { AuthService, TokenResponse } from '../service/auth.service';

/**
 * Test suite for the LoginComponent.
 */
describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let httpBackend: HttpTestingController;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    /**
     * Mock token response for successful login scenarios.
     */
    const mockTokenResponse: TokenResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        refresh_expires_in: 7200,
        token_type: 'Bearer',
    };

    /**
     * Asynchronous setup for each test.
     * Configures the testing module and creates component and service spies.
     */
    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const authServiceSpy = jasmine.createSpyObj('AuthService', [
            'loginSuccess',
        ]);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, FormsModule, HttpClientTestingModule],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        httpBackend = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(
            AuthService,
        ) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture.detectChanges();

        spyOn(component.successModal.nativeElement, 'showModal').and.callFake(
            () => {},
        );
        spyOn(component.successModal.nativeElement, 'close').and.callFake(
            () => {},
        );
        spyOn(component.errorModal.nativeElement, 'showModal').and.callFake(
            () => {},
        );
    });

    /**
     * Verifies that no outstanding HTTP requests are pending after each test.
     */
    afterEach(() => {
        httpBackend.verify();
    });

    /**
     * Test case to ensure the component is successfully created.
     */
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /**
     * Test case for successful login:
     * - Verifies that the success modal is shown.
     * - Verifies navigation to the home page.
     * - Uses `fakeAsync` and `tick` to simulate asynchronous operations.
     */
    it('should show success modal and navigate on successful login', fakeAsync(() => {
        component.login();

        const req = httpBackend.expectOne('https://localhost:3000/auth/token');
        req.flush(mockTokenResponse);
        tick();

        expect(authService.loginSuccess).toHaveBeenCalledWith(
            mockTokenResponse,
        );
        expect(
            component.successModal.nativeElement.showModal,
        ).toHaveBeenCalled();
        tick(1000);
        expect(component.successModal.nativeElement.close).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    }));

    /**
     * Test case for 401 Unauthorized error during login:
     * - Verifies that the error message for incorrect credentials is set.
     * - Verifies that the error modal is shown.
     * - Uses `async` and `whenStable` for asynchronous operations.
     */
    it('should show error modal on 401 error', async () => {
        component.login();

        const req = httpBackend.expectOne('https://localhost:3000/auth/token');
        req.flush(
            { message: 'Unauthorized' },
            { status: 401, statusText: 'Unauthorized' },
        );

        await fixture.whenStable();
        fixture.detectChanges();

        expect(component.loginErrorMessage).toBe(
            'Benutzername oder Passwort ist falsch.',
        );
        expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
    });

    /**
     * Test case for generic server error (e.g., 500 Internal Server Error) during login:
     * - Verifies that the generic error message is set.
     * - Verifies that the error modal is shown.
     * - Uses `async` and `whenStable` for asynchronous operations.
     */
    it('should show generic error modal on server error', async () => {
        component.login();

        const req = httpBackend.expectOne('https://localhost:3000/auth/token');
        req.flush(
            { message: 'Server Error' },
            { status: 500, statusText: 'Internal Server Error' },
        );

        await fixture.whenStable();
        fixture.detectChanges();

        expect(component.loginErrorMessage).toBe(
            'Ein unerwarteter Fehler ist aufgetreten.',
        );
        expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
    });
});
