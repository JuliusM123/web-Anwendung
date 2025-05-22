import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Buch } from './buch.model';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
    selector: 'app-suche',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './suche.component.html',
    styleUrls: ['./suche.component.css'],
})

export class SucheComponent {

    private http = inject(HttpClient);
    public buch: Buch | null | undefined;
    titel = '';
    isbn = '';
    rating = '';
    buchart = '';
    lieferbar: boolean | ''= false;

async suchen(titel: string, isbn: string, rating: string, buchart: string, lieferbar: boolean | '') {
  console.log('Suchen wurde aufgerufen');
  const params: any = {};
  if (isbn) params.isbn = isbn;
  if (titel) params.titel = titel;
  if (rating) params.rating = rating;
  if (buchart) params.art = buchart;
  if (lieferbar !== '') params.lieferbar = lieferbar;

  try {
    const response: any = await firstValueFrom(
      this.http.get('https://localhost:3000/rest', { params })
    );
    console.log('Antwort:', response);

    this.buch = response.content?.[0] ?? null;
  } catch (err) {
    console.error('Fehler beim Suchen', err);
  }
}
}
