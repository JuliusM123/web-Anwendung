import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login';
import { AuthService, TokenResponse } from '../service/auth.service';
import { authInterceptor } from '../interceptor/auth.intercepter';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';

/**
 * Test suite für das LoginComponent.
 * Hier werden die Login-Funktionalität und die Modaldialoge getestet.
 */
describe('LoginComponent', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let component: LoginComponent;
  let fixture: any;

  /**
   * Mock-Token-Antwort für erfolgreiche Login-Szenarien.
   */
  const mockTokenResponse: TokenResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    refresh_expires_in: 7200,
    token_type: 'Bearer',
  };

  /**
   * Vor jedem Test wird die Testumgebung eingerichtet.
   * Es werden Spione für die Modale und Services erstellt.
   */
  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['loginSuccess']);

    TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),provideHttpClientTesting(),
         // Interceptors können hier hinzugefügt werden
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges()

    spyOn(component.successModal.nativeElement, 'showModal').and.callFake(() => {});
    spyOn(component.successModal.nativeElement, 'close').and.callFake(() => {});
    spyOn(component.errorModal.nativeElement, 'showModal').and.callFake(() => {});
  });

  /**
   * Nach jedem Test wird überprüft, ob alle erwarteten HTTP-Anfragen behandelt wurden.
   */
  afterEach(() => {
    httpTestingController.verify();
  });

  /**
   * Testfall: Komponente wird erfolgreich erstellt.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Testfall: Erfolgreiches Login zeigt das Success-Modal und navigiert.
   */
  it('should show success modal and navigate on successful login', () => {
    component.username = 'admin';
    component.password = 'pw';
    component.login();

    const req = httpTestingController.expectOne('https://localhost:3000/auth/token');
    expect(req.request.method).toBe('POST');
    req.flush(mockTokenResponse);

    expect(component.successModal.nativeElement.showModal).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  });

  /**
   * Testfall: Bei 401-Fehler wird das Fehler-Modal mit passender Nachricht angezeigt.
   */
  it('should show error modal on 401 error', () => {
    component.login();

    const req = httpTestingController.expectOne('https://localhost:3000/auth/token');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.loginErrorMessage).toBe('Benutzername oder Passwort ist falsch.');
    expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
  });

  /**
   * Testfall: Bei Serverfehler wird das Fehler-Modal mit generischer Nachricht angezeigt.
   */
  it('should show generic error modal on server error', () => {
    component.login();

    const req = httpTestingController.expectOne('https://localhost:3000/auth/token');
    req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(component.loginErrorMessage).toBe('Ein unerwarteter Fehler ist aufgetreten.');
    expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
  });
});
