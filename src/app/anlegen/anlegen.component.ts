import { Component, inject } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { Buch, BuchArt } from '../../types/buch.model';
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
    isbn = '';
    preis = new Decimal(0);
    rating = 0;
    homepage = '';
    art: BuchArt | '' = '';
    lieferbar = true;

    readonly #token =
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJDZ1NOdmJRTjRvVGxCZktEbEM1OGZMcFA5NF9JNEFVYlhueWxydkFGQ1lvIn0.eyJleHAiOjE3NDg2ODg1NjYsImlhdCI6MTc0ODY4ODI2NiwianRpIjoib25ydHJvOmY3NmQ3MDM4LTk5NzItNDgyMC05MTUzLWVkZDMwNzNjYWI3OCIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL3JlYWxtcy9uZXN0IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImM1MTY2OGRhLTBiYTUtNDdlMS05YTljLTQzZGFmMzdhZmQyNSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im5lc3QtY2xpZW50Iiwic2lkIjoiNzdmMTE1ZWQtYzhlZS00OGZiLTk0MzItMjRiMzM3NTQxNTZjIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2xvY2FsaG9zdDozMDAwIiwiaHR0cHM6Ly9vYXV0aC5wc3Rtbi5pbyIsImh0dHBzOi8vYXV0bzozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1uZXN0Il19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibmVzdC1jbGllbnQiOnsicm9sZXMiOlsiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik5lc3QgQWRtaW4iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbiIsImdpdmVuX25hbWUiOiJOZXN0IiwiZmFtaWx5X25hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AYWNtZS5jb20ifQ.XX5VApaCBGe0rUC7pI7dslhk-NxrMzxtjSgdvvCaGNxGoqiRKPT-2hNhegceGbk83wXgUjfAzCMQn54KwDyvEfkmGPaU9lWl0KYsY_fni7aQ7sertxgA6FeQDFCGG3kdf017Hmk3nwO2DiSV9317gn04b9qNsHNGJNnHvzFgB6BmkGZi8H7ZV9NJehVvgpHORtgqApGdJ15eav4oBEXD6xLSXmP7-bngSCMXAT3V2d-lcZjZIq8UccvPKA0pNkdnlWfn6U0zI7l5l9CaZ7X6cjHeHKA_k3Q9mC-iD0HMmxnlOEAllHmhJOJ8XNf38JLUQmEXc8dcgPFJXK7BUAS4Cw'; // bis Login steht manuell setzen

    async buchSenden() {
        const dummyBuch: Buch = {
            isbn: this.isbn,
            rating: this.rating,
            art: this.art as BuchArt,
            preis: this.preis,
            rabatt: new Decimal(0.123),
            lieferbar: this.lieferbar,
            datum: '2022-02-28',
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
