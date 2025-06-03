import type Decimal from 'decimal.js';
import type { Abbildung } from './abbildung.model';
import type { Titel } from './titel.model';

/**
 * @type {BuchArt}
 * @description
 * Definiert die möglichen Arten eines Buches.
 * Kann 'EPUB', 'HARDCOVER' oder 'PAPERBACK' sein.
 */
export type BuchArt = 'EPUB' | 'HARDCOVER' | 'PAPERBACK';

/**
 * @interface Buch
 * @description
 * Definiert die Struktur für ein Buchobjekt.
 * Enthält alle relevanten Informationen zu einem Buch, wie ISBN, Bewertung, Art, Preis, etc.
 */
export interface Buch {
    isbn: string;
    rating: number;
    art: BuchArt;
    preis: Decimal;
    rabatt: Decimal;
    lieferbar: boolean;
    datum: string;
    homepage: string;
    schlagwoerter: string[];
    titel: Titel;
    abbildung: Abbildung[];
}
