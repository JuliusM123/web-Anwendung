import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AnlegenComponent } from './anlegen';
import { FormsModule } from '@angular/forms';
import {
    HttpErrorResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import Decimal from 'decimal.js';
import { authInterceptor } from '../interceptor/auth.intercepter';

describe('AnlegenComponent', () => {
    let component: AnlegenComponent;
    let fixture: ComponentFixture<AnlegenComponent>;
    let httpTestingController: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnlegenComponent, FormsModule], // AnlegenComponent ist standalone
            providers: [
                provideHttpClientTesting(),
                provideHttpClient(withInterceptors([authInterceptor])), // HttpClient für API-Anfragen
            ], // Keine zusätzlichen Provider nötig, da HttpClientTestingModule bereitgestellt wird
        }).compileComponents();

        fixture = TestBed.createComponent(AnlegenComponent);
        component = fixture.componentInstance;
        httpTestingController = TestBed.inject(HttpTestingController);
        fixture.detectChanges(); // Initialisiert die Komponente und bindet Daten
    });

    afterEach(() => {
        // Überprüfen, ob keine unerwarteten HTTP-Anfragen ausstehen
        httpTestingController.verify();
    });

    // --- Testfälle ---

    it('sollte erstellt werden', () => {
        expect(component).toBeTruthy();
    });

    it('sollte die Standardwerte korrekt initialisieren', () => {
        expect(component.titel).toBe('');
        expect(component.isbn).toBe('');
        expect(component.preis).toBe(0);
        expect(component.rating).toBe(3);
        expect(component.art).toBe('HARDCOVER');
        expect(component.lieferbar).toBe(false);
        expect(component.isJavascriptChecked).toBe(true);
        expect(component.isTypescriptChecked).toBe(true);
        expect(component.schlagwoerter).toEqual([]); // Schlagwörter werden erst in buchSenden gesetzt
        expect(component.error).toBeNull();
        expect(component.responseStatus).toBeNull();
    });

    it('sollte ein Buch erfolgreich anlegen und den Status setzen', async () => {
        // Testdaten vorbereiten
        component.titel = 'Testbuch';
        component.isbn = '978-1234567890';
        component.preis = 19.99;
        component.rabatt = 10;
        component.lieferbar = true;
        component.homepage = 'http://test.com';
        component.isJavascriptChecked = true;
        component.isTypescriptChecked = false; // Nur JAVASCRIPT

        // buchSenden asynchron aufrufen
        const promise = component.buchSenden();

        // Erwarte eine POST-Anfrage an die API
        const req = httpTestingController.expectOne(
            'https://localhost:3000/rest',
        );
        expect(req.request.method).toEqual('POST');
        expect(req.request.body.titel.titel).toEqual('Testbuch');
        expect(req.request.body.isbn).toEqual('978-1234567890');
        expect(req.request.body.preis).toEqual(new Decimal(19.99)); // Decimal Vergleich
        expect(req.request.body.rabatt).toEqual(new Decimal(0.1)); // Rabatt als Decimal.div(100)
        expect(req.request.body.lieferbar).toEqual(true);
        expect(req.request.body.homepage).toEqual('http://test.com');
        expect(req.request.body.schlagwoerter).toEqual(['JAVASCRIPT']);

        // Simuliere eine erfolgreiche Antwort vom Server
        req.flush({}, { status: 201, statusText: 'Created' });

        // Warte, bis der Promise aufgelöst ist
        await promise;

        // Überprüfe, ob der responseStatus gesetzt wurde und der Fehler null ist
        expect(component.responseStatus?.status).toBe(201);
        expect(component.error).toBeNull();
        expect(component.responseStatus).not.toBeNull();
    });

    it('sollte einen Fehler bei fehlgeschlagener API-Anfrage behandeln', async () => {
        // Testdaten vorbereiten (nicht alle Felder nötig für Fehlertest, aber gute Praxis)
        component.titel = 'Fehlerbuch';
        component.isbn = '111';

        const promise = component.buchSenden();

        // Erwarte eine POST-Anfrage
        const req = httpTestingController.expectOne(
            'https://localhost:3000/rest',
        );
        expect(req.request.method).toEqual('POST');

        // Simuliere eine Fehlerantwort vom Server
        const mockError = new ProgressEvent('error');
        req.error(mockError, {
            status: 500,
            statusText: 'Internal Server Error',
        });

        // Warte, bis der Promise aufgelöst ist (catch-Block ausgeführt)
        await promise;

        // Überprüfe, ob der Fehler gesetzt wurde und der responseStatus null ist
        expect(component.error).toBeInstanceOf(HttpErrorResponse);
        expect(component.error?.status).toBe(500);
        expect(component.responseStatus).toBeNull();
    });

    it('sollte die Schlagwörter basierend auf Checkboxen korrekt setzen', async () => {
        component.titel = 'Schlagworttest';
        component.isbn = '123';

        // Fall 1: Beide ausgewählt
        component.isJavascriptChecked = true;
        component.isTypescriptChecked = true;
        let promise = component.buchSenden();
        let req = httpTestingController.expectOne(
            'https://localhost:3000/rest',
        );
        req.flush({}, { status: 201, statusText: 'Created' });
        await promise;
        expect(req.request.body.schlagwoerter).toEqual([
            'JAVASCRIPT',
            'TYPESCRIPT',
        ]);
        httpTestingController.verify(); // Alle Anfragen von diesem Testfall verifizieren

        // Fall 2: Nur JAVASCRIPT
        component.isJavascriptChecked = true;
        component.isTypescriptChecked = false;
        promise = component.buchSenden();
        req = httpTestingController.expectOne('https://localhost:3000/rest');
        req.flush({}, { status: 201, statusText: 'Created' });
        await promise;
        expect(req.request.body.schlagwoerter).toEqual(['JAVASCRIPT']);
        httpTestingController.verify();

        // Fall 3: Nur TYPESCRIPT
        component.isJavascriptChecked = false;
        component.isTypescriptChecked = true;
        promise = component.buchSenden();
        req = httpTestingController.expectOne('https://localhost:3000/rest');
        req.flush({}, { status: 201, statusText: 'Created' });
        await promise;
        expect(req.request.body.schlagwoerter).toEqual(['TYPESCRIPT']);
        httpTestingController.verify();

        // Fall 4: Keine ausgewählt
        component.isJavascriptChecked = false;
        component.isTypescriptChecked = false;
        promise = component.buchSenden();
        req = httpTestingController.expectOne('https://localhost:3000/rest');
        req.flush({}, { status: 201, statusText: 'Created' });
        await promise;
        expect(req.request.body.schlagwoerter).toEqual([]);
        httpTestingController.verify();
    });

    it('sollte `error` und `responseStatus` bei erneutem Senden zurücksetzen', async () => {
        // Zuerst einen Fehler provozieren
        component.titel = 'Fehlerbuch';
        component.isbn = '111';
        let promise = component.buchSenden();
        let req = httpTestingController.expectOne(
            'https://localhost:3000/rest',
        );
        req.error(new ProgressEvent('error'), {
            status: 500,
            statusText: 'Internal Server Error',
        });
        await promise;
        expect(component.error).not.toBeNull();
        expect(component.responseStatus).toBeNull();

        // Dann erfolgreich senden und prüfen, ob vorherige Werte zurückgesetzt werden
        component.titel = 'Erfolgsbuch';
        component.isbn = '222';
        promise = component.buchSenden();
        req = httpTestingController.expectOne('https://localhost:3000/rest');
        req.flush({}, { status: 201, statusText: 'Created' });
        await promise;

        expect(component.error).toBeNull(); // Sollte zurückgesetzt sein
        expect(component.responseStatus?.status).toBe(201); // Sollte neu gesetzt sein
    });
});
