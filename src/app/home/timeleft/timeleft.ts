import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-timeleft',
    standalone: true,
    imports: [],
    templateUrl: './timeleft.html',
    styleUrls: ['./timeleft.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeleftComponent implements OnInit, OnDestroy {
    #targetDate: Date = new Date(2025, 6, 22, 12, 0, 0);

    protected days = 0;
    protected hours = 0;
    protected minutes = 0;
    protected seconds = 0;

    protected isTimeUp = false;

    protected timeUpMessage = 'The time is up';

    #timerInterval: number | undefined;

    ngOnInit(): void {
        this.#updateTimeRemaining();
        this.#timerInterval = window.setInterval(() => {
            this.#updateTimeRemaining();
        }, 1000);
    }

    ngOnDestroy(): void {
        if (this.#timerInterval) {
            window.clearInterval(this.#timerInterval);
        }
    }

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
