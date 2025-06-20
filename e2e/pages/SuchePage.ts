import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object für die Seite "Suchen".
 */
export class SuchePage {
    readonly page: Page;

    readonly titelInput: Locator;
    readonly isbnInput: Locator;
    readonly suchenButton: Locator;

    readonly resultsList: Locator;
    readonly noResultsMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        this.titelInput = page.getByPlaceholder('Titel');
        this.isbnInput = page.getByPlaceholder('ISBN');
        this.suchenButton = page
            .getByRole('group')
            .getByRole('button', { name: 'Suchen' });

        this.resultsList = page.getByRole('list');
        this.noResultsMessage = page.getByText('Kein Buch gefunden');
    }

    /**
     * Navigiert zur Suchen-Seite.
     */
    async goto() {
        await this.page.goto('/suchen');
    }

    /**
     * Führt eine Suche nur nach dem Titel durch.
     * @param titel Der zu suchende Buchtitel.
     */
    async searchByTitle(titel: string) {
        await this.titelInput.fill(titel);
        await this.suchenButton.click();
    }

    /**
     * Gibt NUR die Listeneinträge zurück, die tatsächliche Bücher sind.
     * Filtert Header-Elemente wie "Gefundene Bücher..." heraus.
     */
    getResultItems() {
        return this.resultsList
            .getByRole('listitem')
            .filter({ hasText: 'ISBN:' });
    }
}
