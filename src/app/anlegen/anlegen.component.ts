import { Component, inject } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { Buch, BuchArt } from '../../types/buch.model';
import Decimal from 'decimal.js';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
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
    rating = 0;
    homepage = '';
    art: BuchArt | '' = '';
    lieferbar = true;
    erroer: HttpErrorResponse | null = null;

    readonly #token =
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJDZ1NOdmJRTjRvVGxCZktEbEM1OGZMcFA5NF9JNEFVYlhueWxydkFGQ1lvIn0.eyJleHAiOjE3NDg3NjYzOTUsImlhdCI6MTc0ODc2NjA5NSwianRpIjoib25ydHJvOjM1MmQ2YTU4LWE5Y2EtNGUwNS1iOTA4LTAyZmYyYmQwMDUzYSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL3JlYWxtcy9uZXN0IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImM1MTY2OGRhLTBiYTUtNDdlMS05YTljLTQzZGFmMzdhZmQyNSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im5lc3QtY2xpZW50Iiwic2lkIjoiODk2MDE4NmUtYWI4Ny00NDRlLWEyZDktMjI0YTdlYjBhNDc3IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2xvY2FsaG9zdDozMDAwIiwiaHR0cHM6Ly9vYXV0aC5wc3Rtbi5pbyIsImh0dHBzOi8vYXV0bzozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1uZXN0Il19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibmVzdC1jbGllbnQiOnsicm9sZXMiOlsiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik5lc3QgQWRtaW4iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbiIsImdpdmVuX25hbWUiOiJOZXN0IiwiZmFtaWx5X25hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AYWNtZS5jb20ifQ.zhYyUws0rvr-jcsKVWHZy-t0m5OulkTQ9urO1G-bBW8voGpJxN6mo9CrzgxsV8mMfmYG0PDwH3Y28huN4duH7yH0GyGKmsKOA0zzWaBDCrzj16hOP9f-yLuBEjxaRQM7AZSt-aPiY8k78IeKqmdyp2eIV3eVUdsCiwSZMJKnm54vW0LeiAPSP4mKMi1BYXtZVtYOV84LJhWevhX1rcBzHL95bt2nG3u1iF17GYfTQPxOsdrnMoMtGpnSCKDk-Viabn-d31E6BlxqnwDBLOXN9vFmhBOfSVff57wj4ZZ5MaYtPUU7kwgaX_IouRA64lNeOQfW0HZwiVnT3dttU-h52w'; // bis Login steht manuell setzen

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
                this.#http.post('https://localhost:3000/rest', dummyBuch, {
                    headers,
                }),
            );
            console.log('Buch erfolgreich angelegt:', result);
        } catch (err) {
            if (err instanceof HttpErrorResponse) {
                this.erroer = err;
                console.error('Fehler beim Anlegen:', err.status, err.message);
            } else {
                console.error('Unbekannter Fehler:', err);
            }
        }
    }
}
