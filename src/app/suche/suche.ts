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
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef } from '@angular/core';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Die `SucheComponent` ermöglicht es Benutzern, nach Büchern zu suchen.
 * Sie bietet Filteroptionen wie Titel, ISBN, Bewertung, Buchart und Verfügbarkeit.
 * Die Suchergebnisse werden paginiert angezeigt, und Benutzer können zwischen den Seiten navigieren.
 * Außerdem kann ein ausgewähltes Buch in einem Modal-Dialog detailliert angezeigt werden.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-suche',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './suche.html',
    styleUrls: ['./suche.css'],
})
export class SucheComponent {
    /** Der ChangeDetectorRef für die manuelle Änderungserkennung. */
    private cdr = inject(ChangeDetectorRef);

    /** Der HTTP-Client für die Kommunikation mit dem Backend. */
    #http = inject(HttpClient);

    /** Das Array, das die gefundenen Bücher speichert. */
    public buecher: Buch[] = [];

    /** Das Feld für den Buchtitel im Suchformular. */
    titel = '';
    /** Das Feld für die ISBN im Suchformular. */
    isbn = '';
    /** Das Feld für die Bewertung im Suchformular. */
    rating = '';
    /** Das Feld für die Buchart im Suchformular. */
    buchart = '';
    /** Das Feld für die Lieferbarkeit im Suchformular. */
    lieferbar: boolean | '' = false;

    /** Die aktuelle Seitenzahl der Suchergebnisse (0-basiert). */
    page = 0;
    /** Die Anzahl der Bücher pro Seite. */
    size = 5;
    /** Die Gesamtzahl der verfügbaren Seiten. */
    totalPages = 0;

    /** Ein Flag, das anzeigt, ob bereits eine Suche durchgeführt wurde. */
    public wurdeGesucht = false;

    /** Referenz auf das HTML-Dialogelement für die Buchdetails. */
    @ViewChild('modalRef') modalRef!: ElementRef<HTMLDialogElement>;
    /** Das aktuell ausgewählte Buch, das im Modal angezeigt werden soll. */
    public ausgewaehltesBuch: Buch | undefined = undefined;

    /**
     * Führt eine Suche nach Büchern basierend auf den angegebenen Kriterien durch.
     * Sendet eine GET-Anfrage an das Backend und aktualisiert die Liste der Bücher und die Paginierungsinformationen.
     * @param titel Der Titel des Buches.
     * @param isbn Die ISBN des Buches.
     * @param rating Die Bewertung des Buches.
     * @param buchart Die Art des Buches.
     * @param lieferbar Der Lieferstatus des Buches.
     */
    async suchen(
        titel: string,
        isbn: string,
        rating: string,
        buchart: string,
        lieferbar: boolean | '',
    ): Promise<void> {
        console.log('Suchen wurde aufgerufen');
        const parameters: Record<string, string | number | boolean> = {
            page: this.page + 1,
            size: this.size,
        };

        if (isbn) parameters['isbn'] = isbn;
        if (titel) parameters['titel'] = titel;
        if (rating) parameters['rating'] = rating;
        if (buchart) parameters['art'] = buchart;
        if (lieferbar !== '') parameters['lieferbar'] = lieferbar;

        try {
            const response = await firstValueFrom(
                this.#http.get<{
                    content: Buch[];
                    page: {
                        number: number;
                        size: number;
                        totalElements: number;
                        totalPages: number;
                    };
                }>('/rest', { params: parameters }),
            );
            console.log('Antwort:', response);

            this.buecher = response.content ?? [];
            this.totalPages = response.page.totalPages ?? 1;
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 404) {
                this.buecher = [];
            } else {
                console.error('Fehler beim Suchen', error);
                this.buecher = [];
            }
        }
        this.wurdeGesucht = true;

        this.cdr.markForCheck();
    }

    /**
     * Navigiert zur nächsten Seite der Suchergebnisse, falls verfügbar.
     */
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

    /**
     * Navigiert zur vorherigen Seite der Suchergebnisse, falls verfügbar.
     */
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

    /**
     * Zeigt die Details eines ausgewählten Buches in einem Modal-Dialog an.
     * @param buch Das Buch, dessen Details angezeigt werden sollen.
     */
    public buchAnzeigen(buch: Buch): void {
        this.ausgewaehltesBuch = buch;
        this.modalRef.nativeElement.showModal();
    }

    /**
     * Schließt den Modal-Dialog für die Buchdetails.
     */
    modalSchliessen(): void {
        this.ausgewaehltesBuch = undefined;
    }
}
