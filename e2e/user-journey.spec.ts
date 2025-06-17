import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { AnlegenPage, type BookData } from './pages/AnlegenPage';
import { SuchePage } from './pages/SuchePage';

test.describe('Komplette User Journey', () => {
    test('sollte Login, Anlegen und Suchen erfolgreich durchführen', async ({
        page,
    }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('admin', 'p');
        await expect(
            page.getByRole('button', { name: 'Logout' }),
        ).toBeVisible();
        console.log('Phase 1: Login erfolgreich.');

        const anlegenPage = new AnlegenPage(page);
        const testIsbn = '978-9-0425-9844-7'; // Eine valide, statische ISBN
        const testTitel = `User Journey Buch ${new Date().getTime()}`;

        const buchDaten: BookData = {
            titel: testTitel,
            isbn: testIsbn,
            art: 'PAPERBACK',
            homepage: 'journeytest.com',
        };

        await anlegenPage.goto();
        await anlegenPage.createBook(buchDaten);
        console.log('Phase 2: Buch angelegt.');

        await expect(page.getByRole('alert')).toContainText('201: Created');

        const suchePage = new SuchePage(page);
        await suchePage.goto();

        await suchePage.searchByTitle(testTitel);

        const resultItems = suchePage.getResultItems();
        await expect(resultItems).toHaveCount(1);
        await expect(resultItems.first()).toContainText(testTitel);
        console.log('Phase 3: Suche und Verifizierung erfolgreich.');
    });
});
