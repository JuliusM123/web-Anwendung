import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { Buch } from '../../types/buch.model';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-suche',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './suche.component.html',
    styleUrls: ['./suche.component.css'],
})
export class SucheComponent {
    #http = inject(HttpClient);
    public buch: Buch | null | undefined;
    titel = '';
    isbn = '';
    rating = '';
    buchart = '';
    lieferbar: boolean | '' = false;

    async suchen(
        titel: string,
        isbn: string,
        rating: string,
        buchart: string,
        lieferbar: boolean | '',
    ) {
        console.log('Suchen wurde aufgerufen');
        const params: Record<string, string | number | boolean> = {};
        if (isbn) params['isbn'] = isbn;
        if (titel) params['titel'] = titel;
        if (rating) params['rating'] = rating;
        if (buchart) params['art'] = buchart;
        if (lieferbar !== '') params['lieferbar'] = lieferbar;

        try {
            const response: { content: Buch[] } = await firstValueFrom(
                this.#http.get<{ content: Buch[] }>(
                    'https://localhost:3000/rest',
                    { params },
                ),
            );
            console.log('Antwort:', response);

            this.buch = response.content?.[0] ?? null;
        } catch (err) {
            if (err instanceof HttpErrorResponse && err.status === 404) {
                this.buch = null;
            } else {
                console.error('Fehler beim Suchen', err);
            }
        }
    }
}
