import { type Page, type Locator } from '@playwright/test';

export interface BookData {
    titel: string;
    isbn: string;
    rating: number;
    art: 'HARDCOVER' | 'PAPERBACK' | 'EPUB';
    homepage: string;
    untertitel?: string;
}

export class AnlegenPage {
    readonly page: Page;

    readonly titelInput: Locator;
    readonly untertitelInput: Locator;
    readonly isbnInput: Locator;
    readonly buchartDropdown: Locator;
    readonly homepageInput: Locator;
    readonly anlegenButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.titelInput = page.getByLabel('Titel *');
        this.untertitelInput = page.getByPlaceholder('Untertitel eingeben');
        this.isbnInput = page.getByLabel('ISBN Nummer *');
        this.homepageInput = page.getByLabel('Homepage *');

        this.buchartDropdown = page.getByRole('combobox');

        this.anlegenButton = page
            .locator('app-anlegen')
            .getByRole('button', { name: 'Anlegen' });
    }

    getRatingStars(rating: number): Locator {
        return this.page.locator(`div.rating input[value="${rating}"]`);
    }

    async goto() {
        await this.page.goto('/anlegen');
    }

    /**
     * Füllt das gesamte Formular mit den übergebenen Daten aus und sendet es ab.
     */
    async createBook(data: BookData) {
        await this.titelInput.fill(data.titel);
        if (data.untertitel) {
            await this.untertitelInput.fill(data.untertitel);
        }
        await this.isbnInput.fill(data.isbn);
        await this.homepageInput.fill(data.homepage);

        await this.buchartDropdown.selectOption(data.art);

        await this.getRatingStars(data.rating).click();

        await this.anlegenButton.click();
    }
}
