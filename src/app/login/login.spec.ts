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

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['loginSuccess']);

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
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.loginSuccess and navigate on successful login', fakeAsync(() => {
    component.username = 'admin';
    component.password = 'pw';
    component.login();
    tick(); // Warte auf den initialen Ablauf

    const req = httpTestingController.expectOne(
      'https://localhost:3000/auth/token'
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockTokenResponse);
    tick(); // Auflösung der Login-Promise

    // Überprüfe, ob AuthService.loginSuccess mit dem richtigen Token aufgerufen wurde
    expect(authService.loginSuccess).toHaveBeenCalledWith(mockTokenResponse);

    tick(1000); // Simuliere 1 Sekunde Wartezeit (z.B. für setTimeout in der Komponente)
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('should set error message on 401 error', fakeAsync(() => {
    component.username = 'wrong';
    component.password = 'credentials';
    component.login();
    tick();

    const req = httpTestingController.expectOne(
      'https://localhost:3000/auth/token'
    );
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );
    tick();
    fixture.detectChanges();

    expect(component.loginErrorMessage).toBe(
      'Benutzername oder Passwort ist falsch.'
    );
  }));

  it('should set generic error message on server error', fakeAsync(() => {
    component.username = 'admin';
    component.password = 'pw';
    component.login();
    tick();

    const req = httpTestingController.expectOne(
      'https://localhost:3000/auth/token'
    );
    req.flush(
      { message: 'Server Error' },
      { status: 500, statusText: 'Internal Server Error' }
    );
    tick();
    fixture.detectChanges();

    expect(component.loginErrorMessage).toBe(
      'Ein unerwarteter Fehler ist aufgetreten.'
    );
  }));
});
