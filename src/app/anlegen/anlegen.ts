import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
    templateUrl: './anlegen.html',
    styleUrl: './anlegen.css',
})
export class AnlegenComponent {
    #http = inject(HttpClient);
    #cdr = inject(ChangeDetectorRef);

    titel = '';
    untertitel = '';
    isbn = '';
    schlagwoerter: string[] = [];
    preis = 0;
    rabatt = 0;
    datum = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    rating = 0;
    homepage = '';
    art: BuchArt = 'HARDCOVER';
    lieferbar = true;
    error: HttpErrorResponse | null = null;
    responseStatus: number | null = null;

    isJavascriptChecked = true;
    isTypescriptChecked = true;

    async buchSenden() {
        this.responseStatus = null;
        this.error = null;
        this.#cdr.detectChanges();

        const schlagwoerter: string[] = [];
        if (this.isJavascriptChecked) {
            schlagwoerter.push('JAVASCRIPT');
        }
        if (this.isTypescriptChecked) {
            schlagwoerter.push('TYPESCRIPT');
        }

        const preisDecimal = new Decimal(this.preis);
        const rabattDecimal = new Decimal(this.rabatt);

        const dummyBuch: Buch = {
            isbn: this.isbn,
            rating: this.rating,
            art: this.art,
            preis: preisDecimal,
            rabatt: rabattDecimal.div(100),
            lieferbar: this.lieferbar,
            datum: this.datum,
            homepage: this.homepage,
            schlagwoerter: schlagwoerter,
            titel: {
                titel: this.titel,
                untertitel: this.untertitel,
            },
            abbildung: [
                {
                    beschriftung: 'Abb. 1',
                    contentType: 'img/png',
                },
            ],
        };
        try {
            const response = await firstValueFrom(
                this.#http.post('https://localhost:3000/rest', dummyBuch, {
                    observe: 'response',
                }),
            );
            console.log('Buch erfolgreich angelegt:', response.status);
            this.responseStatus = response.status;
        } catch (err) {
            if (err instanceof HttpErrorResponse) {
                this.error = err;
                console.error('Fehler beim Anlegen:', err.status, err.message);
            } else {
                console.error('Unbekannter Fehler:', err);
            }
        } finally {
            this.#cdr.detectChanges();
        }
    }
}
