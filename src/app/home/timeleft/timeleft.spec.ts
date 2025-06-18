import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { TimeleftComponent } from './timeleft';

/**
 * Test-Suite für die TimeleftComponent.
 */
describe('TimeleftComponent', () => {
  let component: TimeleftComponent;
  let fixture: ComponentFixture<TimeleftComponent>;
  let changeDetectorRef: ChangeDetectorRef;

  const targetDate = new Date(2025, 6, 22, 12, 0, 0);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeleftComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeleftComponent);
    component = fixture.componentInstance;
    changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
  });

  it('sollte erstellt werden', () => {
    expect(component).toBeTruthy();
  });

  describe('mit simulierten Timern', () => {
    /**
     * Überprüft die korrekte Berechnung der verbleibenden Zeit bei der Initialisierung.
     */
    it('sollte die verbleibende Zeit bei Initialisierung korrekt berechnen', fakeAsync(() => {
      const mockNow = new Date(2025, 6, 21, 10, 0, 0).getTime();
      spyOn(Date, 'now').and.returnValue(mockNow);

      fixture.detectChanges();

      expect(component['days']).toBe(1);
      expect(component['hours']).toBe(2);
      expect(component['minutes']).toBe(0);
      expect(component['seconds']).toBe(0);
      expect(component['isTimeUp']).toBeFalse();
    }));

    /**
     * Simuliert das Verstreichen von Zeit und prüft, ob der Countdown aktualisiert wird.
     */
    it('sollte die verbleibende Zeit jede Sekunde aktualisieren', fakeAsync(() => {
      let now = targetDate.getTime() - 5000;
      spyOn(Date, 'now').and.callFake(() => now);

      fixture.detectChanges();
      expect(component['seconds']).toBe(5);

      now += 1000;
      tick(1000);
      changeDetectorRef.detectChanges();
      expect(component['seconds']).toBe(4);

      now += 2000;
      tick(2000);
      changeDetectorRef.detectChanges();
      expect(component['seconds']).toBe(2);
    }));

    /**
     * Überprüft, ob der "Zeit abgelaufen"-Zustand korrekt behandelt wird.
     */
    it('sollte die Zeit-abgelaufen-Nachricht anzeigen, wenn das Zieldatum erreicht ist', fakeAsync(() => {
      let now = targetDate.getTime() - 2000;
      spyOn(Date, 'now').and.callFake(() => now);

      fixture.detectChanges();
      expect(component['isTimeUp']).toBeFalse();

      now += 2000;
      tick(2000);
      changeDetectorRef.detectChanges();

      expect(component['days']).toBe(0);
      expect(component['hours']).toBe(0);
      expect(component['minutes']).toBe(0);
      expect(component['seconds']).toBe(0);
      expect(component['isTimeUp']).toBeTrue();
    }));

    /**
     * Überprüft, ob der "Zeit abgelaufen"-Zustand sofort bei der Initialisierung erkannt wird,
     * wenn die aktuelle Zeit bereits nach dem Zieldatum liegt.
     */
    it('sollte sofort im Zeit-abgelaufen-Zustand sein, wenn die aktuelle Zeit nach dem Ziel liegt', fakeAsync(() => {
      const mockNow = targetDate.getTime() + 100000;
      spyOn(Date, 'now').and.returnValue(mockNow);

      fixture.detectChanges();

      expect(component['isTimeUp']).toBeTrue();
      expect(component['timeUpMessage']).toBe('The time is up');
    }));

    /**
     * Verifiziert, dass der setInterval-Timer beim Zerstören der Komponente korrekt aufgeräumt wird.
     */
    it('sollte das Intervall beim Zerstören der Komponente aufräumen', fakeAsync(() => {
      spyOn(window, 'clearInterval').and.callThrough();

      fixture.detectChanges();

      fixture.destroy();

      expect(window.clearInterval).toHaveBeenCalledTimes(1);
    }));
  });
});