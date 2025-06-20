import { test, expect } from './user-journey.fixture';
import { type BookData } from './pages/AnlegenPage';

test.describe('Komplette User Journey mit Fixture', () => {
    test('sollte Anlegen und Suchen erfolgreich durchführen', async ({
        page,
        loginPage,
        anlegenPage,
        suchePage,
    }) => {
        await loginPage.goto();
        await loginPage.login('admin', 'p');
        await expect(
            page.getByRole('button', { name: 'Logout' }),
        ).toBeVisible();

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

        await suchePage.goto();
        await suchePage.searchByTitle(testTitel);
        const resultItems = suchePage.getResultItems();
        await expect(resultItems).toHaveCount(1);
        await expect(resultItems.first()).toContainText(testTitel);
    });
});
