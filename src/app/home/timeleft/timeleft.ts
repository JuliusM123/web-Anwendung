import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { OnInit, OnDestroy } from '@angular/core';

/**
 * `TimeleftComponent` zeigt einen Countdown bis zu einem festgelegten Zieldatum an.
 * Die Komponente aktualisiert die verbleibende Zeit (Tage, Stunden, Minuten, Sekunden) jede Sekunde.
 * Wenn die Zeit abgelaufen ist, wird eine entsprechende Nachricht angezeigt.
 * Die `OnPush` Change Detection Strategy wird verwendet, um die Performance zu optimieren.
 */
@Component({
    selector: 'app-timeleft',
    standalone: true,
    imports: [],
    templateUrl: './timeleft.html',
    styleUrls: ['./timeleft.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeleftComponent implements OnInit, OnDestroy {
    /**
     * Das Zieldatum, zu dem heruntergezählt wird.
     * Standardmäßig auf den 22. Juli 2025, 12:00:00 Uhr gesetzt (Monat ist 0-basiert).
     */
    #targetDate: Date = new Date(2025, 6, 22, 12, 0, 0);

    /** Die verbleibende Anzahl der Tage. */
    protected days = 0;
    /** Die verbleibende Anzahl der Stunden. */
    protected hours = 0;
    /** Die verbleibende Anzahl der Minuten. */
    protected minutes = 0;
    /** Die verbleibende Anzahl der Sekunden. */
    protected seconds = 0;

    /** Gibt an, ob die Zeit abgelaufen ist. */
    protected isTimeUp = false;

    /** Die Nachricht, die angezeigt wird, wenn die Zeit abgelaufen ist. */
    protected timeUpMessage = 'The time is up';

    /** Der Interval-Timer, der die Zeitaktualisierung steuert. */
    #timerInterval: number | undefined;

    /**
     * Wird beim Initialisieren der Komponente aufgerufen.
     * Startet den Countdown und richtet das Sekunden-Intervall ein.
     */
    ngOnInit(): void {
        this.#updateTimeRemaining();
        this.#timerInterval = window.setInterval(() => {
            this.#updateTimeRemaining();
        }, 1000);
    }

    /**
     * Wird aufgerufen, wenn die Komponente zerstört wird.
     * Löscht den Interval-Timer, um Speicherlecks zu vermeiden.
     */
    ngOnDestroy(): void {
        if (this.#timerInterval) {
            window.clearInterval(this.#timerInterval);
        }
    }

    /**
     * Aktualisiert die verbleibende Zeit bis zum Zieldatum.
     * Berechnet Tage, Stunden, Minuten und Sekunden basierend auf der Differenz
     * zur aktuellen Zeit. Wenn die Zeit abgelaufen ist, wird der Timer gestoppt
     * und `isTimeUp` auf `true` gesetzt.
     */
    #updateTimeRemaining(): void {
        const currentTime = new Date();
        const differenceInMilliseconds =
            this.#targetDate.getTime() - currentTime.getTime();

        if (differenceInMilliseconds <= 0) {
            this.days = 0;
            this.hours = 0;
            this.minutes = 0;
            this.seconds = 0;
            this.isTimeUp = true;
            if (this.#timerInterval) {
                clearInterval(this.#timerInterval);
            }
            return;
        }

        this.isTimeUp = false;

        this.days = Math.floor(
            differenceInMilliseconds / (1000 * 60 * 60 * 24),
        );
        this.hours = Math.floor(
            (differenceInMilliseconds % (1000 * 60 * 60 * 24)) /
                (1000 * 60 * 60),
        );
        this.minutes = Math.floor(
            (differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60),
        );
        this.seconds = Math.floor(
            (differenceInMilliseconds % (1000 * 60)) / 1000,
        );
    }
}