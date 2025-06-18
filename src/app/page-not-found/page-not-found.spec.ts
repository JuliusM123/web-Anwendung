import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageNotFoundComponent } from './page-not-found';

/**
 * Test-Suite für die PageNotFoundComponent.
 */
describe('PageNotFoundComponent', () => {
    let component: PageNotFoundComponent;
    let fixture: ComponentFixture<PageNotFoundComponent>;

    /**
     * Richtet die Testumgebung vor jedem Test ein.
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageNotFoundComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PageNotFoundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /**
     * Erwartet, dass die Komponente erfolgreich erstellt wird.
     */
    it('sollte erstellt werden', () => {
        expect(component).toBeTruthy();
    });

    /**
     * Erwartet, dass das 404-Bild im Template angezeigt wird.
     */
    it('sollte das 404-Bild anzeigen', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const img = compiled.querySelector('img[alt="404"]');
        expect(img).not.toBeNull();
        expect(img?.getAttribute('src')).toContain('assets/error-404.svg');
    });
});
