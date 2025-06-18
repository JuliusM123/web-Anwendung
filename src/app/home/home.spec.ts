import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';

/**
 * Test-Suite für die HomeComponent.
 */
describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    /**
     * Richtet die Testumgebung vor jedem Test ein.
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
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
     * Erwartet, dass die Timeleft-Komponente im Template gerendert wird.
     */
    it('sollte die Timeleft-Komponente im Template rendern', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const timeleftElement = compiled.querySelector('app-timeleft');
        expect(timeleftElement).not.toBeNull();
    });
});
