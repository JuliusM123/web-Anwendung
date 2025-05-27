import type Decimal from 'decimal.js';
import type { Abbildung } from './abbildung.model';
import type { Titel } from './titel.model';

export type BuchArt = 'EPUB' | 'HARDCOVER' | 'PAPERBACK';

export interface Buch {
    isbn: string;
    rating: number;
    art: BuchArt;
    preis: Decimal;
    rabatt: Decimal;
    lieferbar: boolean;
    titel: Titel;
    abbildung: Abbildung[];
}
