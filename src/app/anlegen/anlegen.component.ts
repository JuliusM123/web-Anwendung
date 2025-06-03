import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import type { Buch, BuchArt } from '../../types/buch.model';
import Decimal from 'decimal.js';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

/**
 * @Component AnlegenComponent
 * @description
 * This component provides a user interface for creating new books.
 * It allows users to input various details for a book such as title, ISBN,
 * price, rating, homepage, book type, and availability.
 * The new book data is then sent to a REST API via a POST request,
 * including an authorization token.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-anlegen',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './anlegen.component.html',
    styleUrl: './anlegen.component.css',
})
export class AnlegenComponent {
    #http = inject(HttpClient);

    titel = '';
    isbn = '';
    preis = new Decimal(0);
    rabatt = new Decimal(0);
    datum = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    rating = 0;
    homepage = '';
    art: BuchArt | '' = '';
    lieferbar = true;
    error: HttpErrorResponse | null = null;
    responseStatus: number | null = null;

    readonly #token = 'Hier kommt der Token für die Authentifizierung hin';

    async buchSenden() {
        const dummyBuch: Buch = {
            isbn: this.isbn,
            rating: this.rating,
            art: this.art as BuchArt,
            preis: this.preis,
            rabatt: this.rabatt.div(100),
            lieferbar: this.lieferbar,
            datum: this.datum,
            homepage: this.homepage,
            schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT'],
            titel: {
                titel: this.titel,
                untertitel: 'untertitelpost',
            },
            abbildung: [
                {
                    beschriftung: 'Abb. 1',
                    contentType: 'img/png',
                },
            ],
        };
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.#token}`,
            'Content-Type': 'application/json',
        });
        try {
            const response = await firstValueFrom(
                this.#http.post('https://localhost:3000/rest', dummyBuch, {
                    headers,
                    observe: 'response',
                }),
            );
            console.log('Buch erfolgreich angelegt:', response.status);
            this.responseStatus = response.status;
            this.error = null;
        } catch (err) {
            if (err instanceof HttpErrorResponse) {
                this.error = err;
                console.error('Fehler beim Anlegen:', err.status, err.message);
            } else {
                console.error('Unbekannter Fehler:', err);
            }
        }
    }
}
