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
  rating = 0;
  homepage = '';
  art: BuchArt | '' = '';
  lieferbar = true;
  error: HttpErrorResponse | null = null;
  responseStatus: number | null = null;

  readonly #token =
    'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJDZ1NOdmJRTjRvVGxCZktEbEM1OGZMcFA5NF9JNEFVYlhueWxydkFGQ1lvIn0.eyJleHAiOjE3NDg3NzA1MTIsImlhdCI6MTc0ODc3MDIxMiwianRpIjoib25ydHJvOmQ1ZTIzMjZiLTdmZmQtNDAyNC1hYjkwLWI3NTUwOGI1ZmQyZCIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL3JlYWxtcy9uZXN0IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImM1MTY2OGRhLTBiYTUtNDdlMS05YTljLTQzZGFmMzdhZmQyNSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im5lc3QtY2xpZW50Iiwic2lkIjoiNWU3MWZjYjktNWM4My00NWU3LWE3ZWUtMTNmNzNhOTBiMmI4IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2xvY2FsaG9zdDozMDAwIiwiaHR0cHM6Ly9vYXV0aC5wc3Rtbi5pbyIsImh0dHBzOi8vYXV0bzozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1uZXN0Il19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibmVzdC1jbGllbnQiOnsicm9sZXMiOlsiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik5lc3QgQWRtaW4iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbiIsImdpdmVuX25hbWUiOiJOZXN0IiwiZmFtaWx5X25hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AYWNtZS5jb20ifQ.guciVtkKBGjIGwFAwqXvpfRPOq44R24lFRIrWKc8gEhGYAmBgHH6e905qpdEu_gP4e1LF663bLhHkKxh_-tsMQUgGHcwMtjDtR3GqxjFnY5be8R0W0xGP-QFmF1ajYaBJso-dh83LBAdwK_UothGi7xO4AFB29wjirO7BsM9vagdzXBJPERrPt9uYLHz4e_EfjkwFhzfrblrtAYKk-8gkO_LrO-i0uLqDuG78x4TIrtrLuQMEaS_-228KzzKj27cLo-Kww2NZBFU7d56p-nMIdlb0nHwh-Dr5TYdbGeVsJ8e-LGSgG1_fx7uxPnx9F0D9IBOIhbcYxaqeW1hUFSUaQ';

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