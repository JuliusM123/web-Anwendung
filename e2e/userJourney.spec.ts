import { test, expect } from '@playwright/test';
import { AnlegenPage, type BookData } from './pages/AnlegenPage';
import { SuchePage } from './pages/SuchePage';

test.describe('Komplette User Journey', () => {
    test('sollte Anlegen und Suchen erfolgreich durchführen', async ({
        page,
    }) => {
        const anlegenPage = new AnlegenPage(page);
        const testIsbn = '978-9-0425-9844-7';
        const testTitel = `User Journey Buch ${new Date().getTime()}`;

        const buchDaten: BookData = {
            titel: testTitel,
            isbn: testIsbn,
            art: 'PAPERBACK',
            homepage: 'journeytest.com',
        };

        await anlegenPage.goto();
        await anlegenPage.createBook(buchDaten);

        await expect(page.getByRole('alert')).toContainText('201: Created');

        const suchePage = new SuchePage(page);
        await suchePage.goto();

        await suchePage.searchByTitle(testTitel);

        const resultItems = suchePage.getResultItems();
        await expect(resultItems).toHaveCount(1);
        await expect(resultItems.first()).toContainText(testTitel);
    });
});
