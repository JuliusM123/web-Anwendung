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
    error: HttpErrorResponse | null = null;
    responseStatus: number | null = null;

    readonly #token =
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJDZ1NOdmJRTjRvVGxCZktEbEM1OGZMcFA5NF9JNEFVYlhueWxydkFGQ1lvIn0.eyJleHAiOjE3NDg3Njg3ODUsImlhdCI6MTc0ODc2ODQ4NSwianRpIjoib25ydHJvOjZkNGQzZGFhLTVmMmUtNDk0My04YWQxLTZiMGMzZGQzMTg4YiIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL3JlYWxtcy9uZXN0IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImM1MTY2OGRhLTBiYTUtNDdlMS05YTljLTQzZGFmMzdhZmQyNSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im5lc3QtY2xpZW50Iiwic2lkIjoiY2VlNzViY2QtYTI5NS00NjFhLWJiMmQtZGZlNzZiNWYyYjZmIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2xvY2FsaG9zdDozMDAwIiwiaHR0cHM6Ly9vYXV0aC5wc3Rtbi5pbyIsImh0dHBzOi8vYXV0bzozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1uZXN0Il19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibmVzdC1jbGllbnQiOnsicm9sZXMiOlsiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik5lc3QgQWRtaW4iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbiIsImdpdmVuX25hbWUiOiJOZXN0IiwiZmFtaWx5X25hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AYWNtZS5jb20ifQ.A1Hvk30mHk8ERbL21tRfmLGNfc9ntnKbJFwkf-pUkDmlKVc6LxGh_tNYNEYzhGSmqDfbA4weII9Q2HHyluOWRQiMZLIh6-qCgXmqUWCoXZUajCJ5QBVWtYN3it9FVerZSfpdx3mULSSS4P08bFGCLOTxIPXnTiSGCJ9wyaVtWuIXKhRWCcVTHtqPJBp0qEdrt9sUc4vlMgUVDs1CLicKpSQcArZ6a0OySwECN-ScqY1SmFMyZxGzmWOjr6gOPDWLjPZvN9blytceZ-lx6jTXw68VeKcAcllfh1gC1XN0kwpKfNCE2LS2VjPeDmD8-8kBGD3vbjS67EqNWReVMu6izA'; // bis Login steht manuell setzen

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
            const response = await firstValueFrom(
                this.#http.post('https://localhost:3000/rest', dummyBuch, {
                    headers,
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
        }
    }
}
