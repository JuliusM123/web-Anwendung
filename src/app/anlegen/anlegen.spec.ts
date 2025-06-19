import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AnlegenComponent } from './anlegen';
import { FormsModule } from '@angular/forms';
import {
    HttpClient,
    HttpErrorResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import Decimal from 'decimal.js';
import { authInterceptor } from '../interceptor/auth.interceptor';

/**
 * Test suite for the AnlegenComponent.
 */
describe('AnlegenComponent', () => {
    let component: AnlegenComponent;
    let fixture: ComponentFixture<AnlegenComponent>;
    let httpTestingController: HttpTestingController;
    let httpClient: HttpClient;

    /**
     * Sets up the test environment before each test case.
     * Configures the TestBed with necessary imports and providers,
     * creates the component instance, and injects testing utilities.
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnlegenComponent, FormsModule],
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AnlegenComponent);
        component = fixture.componentInstance;
        httpTestingController = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
        fixture.detectChanges();
    });

    /**
     * Verifies that there are no outstanding HTTP requests after each test.
     */
    afterEach(() => {
        httpTestingController.verify();
    });

    /**
     * @test {AnlegenComponent}
     * Tests if the component instance is created successfully.
     */
    it('sollte erstellt werden', () => {
        expect(component).toBeTruthy();
    });

    /**
     * @test {AnlegenComponent}
     * Tests if the component's properties are initialized with the correct default values.
     */
    it('sollte die Standardwerte korrekt initialisieren', () => {
        expect(component.titel).toBe('');
        expect(component.isbn).toBe('');
        expect(component.preis).toBe(0);
        expect(component.rating).toBe(3);
        expect(component.art).toBe('HARDCOVER');
        expect(component.lieferbar).toBe(false);
        expect(component.isJavascriptChecked).toBe(true);
        expect(component.isTypescriptChecked).toBe(true);
        expect(component.schlagwoerter).toEqual([]);
        expect(component.error).toBeUndefined();
        expect(component.responseStatus).toBeUndefined();
    });

    /**
     * @test {AnlegenComponent#buchSenden}
     * Tests the successful creation of a book.
     * It verifies that the correct POST request is sent and that the component's state
     * is updated accordingly on a successful response.
     */
    it('sollte ein Buch erfolgreich anlegen und den Status setzen', async () => {
        component.titel = 'Testbuch';
        component.isbn = '978-1234567890';
        component.preis = 19.99;
        component.rabatt = 10;
        component.lieferbar = true;
        component.homepage = 'http://test.com';
        component.isJavascriptChecked = true;
        component.isTypescriptChecked = false;

        const promise = component.buchSenden();

        const req = httpTestingController.expectOne(
            'https://localhost:3000/rest',
        );
        expect(req.request.method).toEqual('POST');
        expect(req.request.body.titel.titel).toEqual('Testbuch');
        expect(req.request.body.isbn).toEqual('978-1234567890');
        expect(req.request.body.preis).toEqual(new Decimal(19.99));
        expect(req.request.body.rabatt).toEqual(new Decimal(0.1));
        expect(req.request.body.lieferbar).toEqual(true);
        expect(req.request.body.homepage).toEqual('http://test.com');
        expect(req.request.body.schlagwoerter).toEqual(['JAVASCRIPT']);

        req.flush({}, { status: 201, statusText: 'Created' });

        await promise;

        expect(component.responseStatus?.status).toBe(201);
        expect(component.error).toBeUndefined();
        expect(component.responseStatus).not.toBeNull();
    });

    /**
     * @test {AnlegenComponent#buchSenden}
     * Tests the error handling when an API request fails.
     * It simulates a server error and verifies that the component's error state is set correctly.
     */
    it('sollte einen Fehler bei fehlgeschlagener API-Anfrage behandeln', async () => {
        component.titel = 'Fehlerbuch';
        component.isbn = '111';

        const promise = component.buchSenden();

        const req = httpTestingController.expectOne(
            'https://localhost:3000/rest',
        );
        expect(req.request.method).toEqual('POST');

        const mockError = new ProgressEvent('error');
        req.error(mockError, {
            status: 500,
            statusText: 'Internal Server Error',
        });

        await promise;

        expect(component.error).toBeInstanceOf(HttpErrorResponse);
        expect(component.error?.status).toBe(500);
        expect(component.responseStatus).toBeUndefined();
    });

    /**
     * @test {AnlegenComponent#buchSenden}
     * Tests that the keywords (`schlagwoerter`) are set correctly based on the state of the checkboxes.
     */
    it('sollte die Schlagwörter basierend auf Checkboxen korrekt setzen', async () => {
        component.titel = 'Schlagworttest';
        component.isbn = '123';

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
        httpTestingController.verify();

        component.isJavascriptChecked = true;
        component.isTypescriptChecked = false;
        promise = component.buchSenden();
        req = httpTestingController.expectOne('https://localhost:3000/rest');
        req.flush({}, { status: 201, statusText: 'Created' });
        await promise;
        expect(req.request.body.schlagwoerter).toEqual(['JAVASCRIPT']);
        httpTestingController.verify();

        component.isJavascriptChecked = false;
        component.isTypescriptChecked = true;
        promise = component.buchSenden();
        req = httpTestingController.expectOne('https://localhost:3000/rest');
        req.flush({}, { status: 201, statusText: 'Created' });
        await promise;
        expect(req.request.body.schlagwoerter).toEqual(['TYPESCRIPT']);
        httpTestingController.verify();

        component.isJavascriptChecked = false;
        component.isTypescriptChecked = false;
        promise = component.buchSenden();
        req = httpTestingController.expectOne('https://localhost:3000/rest');
        req.flush({}, { status: 201, statusText: 'Created' });
        await promise;
        expect(req.request.body.schlagwoerter).toEqual([]);
        httpTestingController.verify();
    });

    /**
     * @test {AnlegenComponent#buchSenden}
     * Tests that the `error` and `responseStatus` properties are correctly reset
     * when a new submission is made after a previous one.
     */
    it('sollte `error` und `responseStatus` bei erneutem Senden zurücksetzen', async () => {
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
        expect(component.error).not.toBeUndefined();
        expect(component.responseStatus).toBeUndefined();

        component.titel = 'Erfolgsbuch';
        component.isbn = '222';
        promise = component.buchSenden();
        req = httpTestingController.expectOne('https://localhost:3000/rest');
        req.flush({}, { status: 201, statusText: 'Created' });
        await promise;

        expect(component.error).toBeUndefined();
        expect(component.responseStatus?.status).toBe(201);
    });
});
