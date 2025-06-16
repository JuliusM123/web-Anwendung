import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { LoginComponent } from './login';
import { AuthService, TokenResponse } from '../service/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTestingController: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockTokenResponse: TokenResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    refresh_expires_in: 7200,
    token_type: 'Bearer',
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['loginSuccess']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // WICHTIG: Die Change-Detection zuerst ausführen!
    // Dadurch wird das Template gerendert und @ViewChild kann die <dialog>-Elemente finden.
    fixture.detectChanges();

    // JETZT, da die Elemente existieren, können wir direkt darauf Spione setzen.
    // Wir umgehen das Problem, indem wir nicht mocken, sondern das echte Objekt beobachten.
    spyOn(component.successModal.nativeElement, 'showModal').and.callFake(() => {});
    spyOn(component.successModal.nativeElement, 'close').and.callFake(() => {});
    spyOn(component.errorModal.nativeElement, 'showModal').and.callFake(() => {});
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('sollte erstellt werden', () => {
    expect(component).toBeTruthy();
  });

  it('sollte bei erfolgreichem Login das Erfolgs-Modal anzeigen und navigieren', fakeAsync(() => {
    component.login();

    const req = httpTestingController.expectOne('https://localhost:3000/auth/token');
    req.flush(mockTokenResponse);
    tick();

    expect(authService.loginSuccess).toHaveBeenCalledWith(mockTokenResponse);
    expect(component.successModal.nativeElement.showModal).toHaveBeenCalled();
    
    tick(1000);

    expect(component.successModal.nativeElement.close).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('sollte bei 401-Fehler eine Fehlermeldung anzeigen und das Fehler-Modal öffnen', async () => {
    component.login();

    const req = httpTestingController.expectOne('https://localhost:3000/auth/token');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.loginErrorMessage).toBe('Benutzername oder Passwort ist falsch.');
    expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
  });

  it('sollte bei einem generischen Serverfehler eine allgemeine Fehlermeldung anzeigen', async () => {
    component.login();

    const req = httpTestingController.expectOne('https://localhost:3000/auth/token');
    req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });

    await fixture.whenStable();
    fixture.detectChanges();
    
    expect(component.loginErrorMessage).toBe('Ein unerwarteter Fehler ist aufgetreten.');
    expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
  });
});