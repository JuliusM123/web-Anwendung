import { Component, inject } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { Buch } from '../../types/buch.model';
import Decimal from 'decimal.js';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-anlegen',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './anlegen.component.html',
    styleUrl: './anlegen.component.css',
})
export class AnlegenComponent {
    private http = inject(HttpClient);

    titel = '';

    private readonly token = 'VORLÄUFIGER JWT TOKEN -> mit dem Token ersetzen'; // bis Login steht manuell setzen

    async buchSenden() {
        const dummyBuch: Buch = {
            isbn: '978-0-007-00644-1',
            rating: 1,
            art: 'HARDCOVER',
            preis: new Decimal(99.99),
            rabatt: new Decimal(0.123),
            lieferbar: true,
            datum: '2022-02-28',
            homepage: 'https://post.rest',
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
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        });
        try {
            const result = await firstValueFrom(
                this.http.post<Buch>('https://localhost:3000/rest', dummyBuch, {
                    headers,
                }),
            );
            console.log('Buch erfolgreich angelegt:', result);
        } catch (err) {
            if (err instanceof HttpErrorResponse) {
                console.error('Fehler beim Anlegen:', err.status, err.message);
            } else {
                console.error('Unbekannter Fehler:', err);
            }
        }
    }
}
