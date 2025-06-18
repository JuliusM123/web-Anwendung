import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import type { HttpResponse } from '@angular/common/http';
import type { Buch, BuchArt } from '../../types/buch.model';
import Decimal from 'decimal.js';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

/**
 * Der `AnlegenComponent` bietet eine Benutzeroberfläche zum Erstellen neuer Bücher.
 * Benutzer können verschiedene Buchdetails wie Titel, ISBN, Preis, Bewertung,
 * Homepage, Buchtyp und Verfügbarkeit eingeben.
 * Die neuen Buchdaten werden dann per POST-Anfrage an eine REST-API gesendet,
 * inklusive eines Autorisierungstokens.
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
    /** Der HTTP-Client für die Kommunikation mit der API. */
    #http = inject(HttpClient);
    /** Der ChangeDetectorRef für die manuelle Änderungserkennung. */
    #cdr = inject(ChangeDetectorRef);

    /** Das Feld für den Titel des Buches. */
    titel = '';
    /** Das Feld für den Untertitel des Buches. */
    untertitel = '';
    /** Das Feld für die ISBN des Buches. */
    isbn = '';
    /** Ein Array von Schlagwörtern für das Buch. */
    schlagwoerter: string[] = [];
    /** Der Preis des Buches. */
    preis = 0;
    /** Der Rabatt in Prozent für das Buch. */
    rabatt = 0;
    /** Das aktuelle Datum, formatiert als 'YYYY-MM-DD'. */
    datum = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    /** Die Bewertung des Buches (Standard: 3). */
    rating = 3;
    /** Die Homepage des Buches. */
    homepage = '';
    /** Die Art des Buches (Standard: 'HARDCOVER'). */
    art: BuchArt = 'HARDCOVER';
    /** Gibt an, ob das Buch lieferbar ist. */
    lieferbar = false;
    /** Speichert einen `HttpErrorResponse` im Falle eines Fehlers. */
    error: HttpErrorResponse | undefined = undefined;
    /** Speichert die HTTP-Antwort bei Erfolg. */
    responseStatus: HttpResponse<unknown> | undefined = undefined;

    /** Steuert, ob das Schlagwort 'JAVASCRIPT' ausgewählt ist. */
    isJavascriptChecked = true;
    /** Steuert, ob das Schlagwort 'TYPESCRIPT' ausgewählt ist. */
    isTypescriptChecked = true;

    /**
     * Sendet die Buchdaten an das Backend.
     * Erstellt ein `Buch`-Objekt aus den Formulardaten und sendet es per POST-Anfrage.
     * Behandelt Erfolgs- und Fehlermeldungen und aktualisiert die UI.
     */
    async buchSenden() {
        this.responseStatus = undefined;
        this.error = undefined;
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
            this.responseStatus = response;
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                this.error = error;
                console.error(
                    'Fehler beim Anlegen:',
                    error.status,
                    error.message,
                );
            } else {
                console.error('Unbekannter Fehler:', error);
            }
        } finally {
            this.#cdr.detectChanges();
        }
    }
}
