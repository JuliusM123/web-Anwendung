import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { AuthService } from './service/auth.service';
import { provideRouter } from '@angular/router';

/**
 * @description Ein einfacher Mock für den AuthService, um ihn im Test zu ersetzen.
 */
class MockAuthService {}

/**
 * @description Test-Suite für die AppComponent.
 */
describe('AppComponent', () => {
  /**
   * @description Richtet die Testumgebung vor jedem einzelnen Testlauf ein.
   * Konfiguriert das Angular TestBed mit den notwendigen Imports und Providern.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService }
      ],
    }).compileComponents();
  });

  /**
   * @description Testet, ob die AppComponent erfolgreich instanziiert werden kann.
   */
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  /**
   * @description Überprüft, ob die `title`-Eigenschaft der Komponente den korrekten Wert 'web-Anwendung' hat.
   */
  it(`should have the 'web-Anwendung' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('web-Anwendung');
  });

  /**
   * @description Verifiziert, dass der `AuthService` korrekt in die Komponente injiziert wird
   * und eine Instanz des `MockAuthService` ist.
   */
  it('should inject the AuthService', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.authService).toBeTruthy();
    expect(app.authService).toBeInstanceOf(MockAuthService);
  });
});
