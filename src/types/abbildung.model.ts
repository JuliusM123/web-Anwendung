/**
 * @interface Abbildung
 * @description
 * Definiert die Struktur für ein Abbildungsobjekt.
 * Eine Abbildung kann eine ID, eine Beschriftung und einen Content-Typ haben.
 */
export interface Abbildung {
    id?: number;
    beschriftung?: string;
    contentType?: string;
}
