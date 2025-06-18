import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { AuthService } from './service/auth.service';
import { provideRouter } from '@angular/router';

/**
 * Ein einfacher Mock für den AuthService, um ihn im Test zu ersetzen.
 */
class MockAuthService {}

/**
 * Test-Suite für die AppComponent.
 */
describe('AppComponent', () => {
    /**
     * Richtet die Testumgebung vor jedem einzelnen Testlauf ein.
     * Konfiguriert das Angular TestBed mit den notwendigen Imports und Providern.
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useClass: MockAuthService },
            ],
        }).compileComponents();
    });

    /**
     * Testet, ob die AppComponent erfolgreich instanziiert werden kann.
     */
    it('sollte die AppComponent erstellen', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    /**
     * Überprüft, ob die `title`-Eigenschaft der Komponente den korrekten Wert 'web-Anwendung' hat.
     */
    it('sollte den Titel "web-Anwendung" haben', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.title).toEqual('web-Anwendung');
    });

    /**
     * Verifiziert, dass der `AuthService` korrekt in die Komponente injiziert wird
     * und eine Instanz des `MockAuthService` ist.
     */
    it('sollte den AuthService injizieren', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.authService).toBeTruthy();
        expect(app.authService).toBeInstanceOf(MockAuthService);
    });
});
