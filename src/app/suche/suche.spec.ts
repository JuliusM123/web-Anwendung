import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import { SucheComponent } from './suche';
import {
    HttpClientTestingModule,
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Buch } from '../../types/buch.model';
import { Titel } from '../../types/titel.model';
import Decimal from 'decimal.js';
import {
    HttpClient,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from '../interceptor/auth.intercepter';

/**
 * Test-Suite für die SucheComponent.
 */
describe('SucheComponent', () => {
    let component: SucheComponent;
    let fixture: ComponentFixture<SucheComponent>;
    let httpTestingController: HttpTestingController;
    let httpClient: HttpClient;

    /**
     * Richtet die Testumgebung vor jedem Test ein.
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SucheComponent, FormsModule, CommonModule],
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(), // Hier können Interceptors hinzugefügt werden
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SucheComponent);
        component = fixture.componentInstance;
        httpTestingController = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
        fixture.detectChanges();
    });

    /**
     * Erwartet, dass die Komponente erfolgreich erstellt wird.
     */
    it('sollte erstellt werden', () => {
        expect(component).toBeTruthy();
    });

    /**
     * Erwartet, dass eine erfolgreiche Suche Bücher liefert und die Pagination aktualisiert.
     */
    it('sollte Bücher suchen und Pagination setzen', fakeAsync(() => {
        const mockBuecher: Buch[] = [
            {
                isbn: '123',
                rating: 5,
                art: 'HARDCOVER',
                lieferbar: true,
                titel: { titel: 'Testbuch' } as Titel,
                abbildung: [],
                preis: new Decimal(19.99),
                rabatt: new Decimal(0),
                datum: '2023-01-01',
                homepage: 'https://example.com',
                schlagwoerter: ['TYPESCRIPT', 'JAVASCRIPT'],
            },
        ];
        const mockResponse = {
            content: mockBuecher,
            page: {
                number: 0,
                size: 5,
                totalElements: 1,
                totalPages: 1,
            },
        };

        component.titel = 'Testbuch';
        let promiseResolved = false;
        component.suchen('Testbuch', '', '', '', '').then(() => {
            promiseResolved = true;
            expect(component.buecher.length).toBe(1);
            expect(component.buecher[0].titel.titel).toBe('Testbuch');
            expect(component.totalPages).toBe(1);
        });

        const req = httpTestingController.expectOne((r) =>
            r.url.endsWith('/rest'),
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        tick();
        expect(promiseResolved).toBeTrue();
        httpTestingController.verify();
    }));

    /**
     * Erwartet, dass bei einem 404-Fehler die Bücherliste leer bleibt.
     */
    it('sollte bei 404-Fehler eine leere Bücherliste setzen', fakeAsync(() => {
        let promiseResolved = false;
        component.suchen('NichtVorhanden', '', '', '', '').then(() => {
            promiseResolved = true;
            expect(component.buecher.length).toBe(0);
        });

        const req = httpTestingController.expectOne((r) =>
            r.url.endsWith('/rest'),
        );
        req.flush({}, { status: 404, statusText: 'Not Found' });

        tick();
        expect(promiseResolved).toBeTrue();
        httpTestingController.verify();
    }));

    /**
     * Erwartet, dass das Modal für Buchdetails angezeigt wird.
     */
    it('sollte das Modal für Buchdetails anzeigen', () => {
        const buch: Buch = {
            isbn: '123',
            rating: 5,
            art: 'HARDCOVER',
            lieferbar: true,
            titel: { titel: 'Testbuch' } as Titel,
            abbildung: [],
            preis: new Decimal(19.99),
            rabatt: new Decimal(0),
            datum: '2023-01-01',
            homepage: 'https://example.com',
            schlagwoerter: ['TYPESCRIPT', 'JAVASCRIPT'],
        };
        component.modalRef = {
            nativeElement: { showModal: jasmine.createSpy('showModal') },
        } as any;
        component.buchAnzeigen(buch);
        expect(component.ausgewaehltesBuch).toBe(buch);
        expect(component.modalRef.nativeElement.showModal).toHaveBeenCalled();
    });

    /**
     * Erwartet, dass das Modal geschlossen werden kann.
     */
    it('sollte das Modal schließen', () => {
        component.ausgewaehltesBuch = {
            isbn: '123',
            rating: 5,
            art: 'HARDCOVER',
            lieferbar: true,
            titel: { titel: 'Testbuch' } as Titel,
            abbildung: [],
            preis: new Decimal(19.99),
            rabatt: new Decimal(0),
            datum: '2023-01-01',
            homepage: 'https://example.com',
            schlagwoerter: ['TYPESCRIPT', 'JAVASCRIPT'],
        };
        component.modalSchliessen();
        expect(component.ausgewaehltesBuch).toBeUndefined();
    });
});
