import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Buch } from '../../types/buch.model';
import { FormsModule } from '@angular/forms';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-suche',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './suche.html',
    styleUrls: ['./suche.css'],
})
export class SucheComponent {
    #http = inject(HttpClient);
    constructor(private cdr: ChangeDetectorRef) {}

    public buecher: Buch[] = [];

    titel = '';
    isbn = '';
    rating = '';
    buchart = '';
    lieferbar: boolean | '' = false;

    page = 0;
    size = 5;
    totalPages = 0;

    public wurdeGesucht = false;

    async suchen(
        titel: string,
        isbn: string,
        rating: string,
        buchart: string,
        lieferbar: boolean | '',
    ): Promise<void> {
        console.log('Suchen wurde aufgerufen');
        const params: Record<string, string | number | boolean> = {
            page: this.page,
            size: this.size,
        };

        if (isbn) params['isbn'] = isbn;
        if (titel) params['titel'] = titel;
        if (rating) params['rating'] = rating;
        if (buchart) params['art'] = buchart;
        if (lieferbar !== '') params['lieferbar'] = lieferbar;

        try {
            const response = await firstValueFrom(
                this.#http.get<{ content: Buch[]; totalPages: number }>(
                    'https://localhost:3000/rest',
                    { params },
                ),
            );
            console.log('Antwort:', response);

            this.buecher = response.content ?? [];
            this.totalPages = response.totalPages ?? 1;
        } catch (err) {
            if (err instanceof HttpErrorResponse && err.status === 404) {
                this.buecher = [];
            } else {
                console.error('Fehler beim Suchen', err);
                this.buecher = [];
            }
        }
        this.wurdeGesucht = true;

        this.cdr.markForCheck();
    }

    async nextPage(): Promise<void> {
        if (this.page + 1 < this.totalPages) {
            this.page++;
            await this.suchen(
                this.titel,
                this.isbn,
                this.rating,
                this.buchart,
                this.lieferbar,
            );
        }
    }

    async prevPage(): Promise<void> {
        if (this.page > 0) {
            this.page--;
            await this.suchen(
                this.titel,
                this.isbn,
                this.rating,
                this.buchart,
                this.lieferbar,
            );
        }
    }
}
