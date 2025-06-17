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

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-suche',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './suche.html',
    styleUrls: ['./suche.css'],
})
export class SucheComponent {
    private cdr = inject(ChangeDetectorRef);

    #http = inject(HttpClient);

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

    @ViewChild('modalRef') modalRef!: ElementRef<HTMLDialogElement>;
    public ausgewaehltesBuch: Buch | null = null;

    async suchen(
        titel: string,
        isbn: string,
        rating: string,
        buchart: string,
        lieferbar: boolean | '',
    ): Promise<void> {
        console.log('Suchen wurde aufgerufen');
        const params: Record<string, string | number | boolean> = {
            page: this.page + 1,
            size: this.size,
        };

        if (isbn) params['isbn'] = isbn;
        if (titel) params['titel'] = titel;
        if (rating) params['rating'] = rating;
        if (buchart) params['art'] = buchart;
        if (lieferbar !== '') params['lieferbar'] = lieferbar;

        console.log('➡️ Params für Request:', params);

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
                }>('/rest', { params }),
            );
            console.log('Antwort:', response);

            this.buecher = response.content ?? [];
            this.totalPages = response.page.totalPages ?? 1;
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

    public buchAnzeigen(buch: Buch): void {
        this.ausgewaehltesBuch = buch;
        this.modalRef.nativeElement.showModal();
    }

    modalSchliessen(): void {
        this.ausgewaehltesBuch = null;
    }
}
