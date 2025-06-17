import { test, expect } from '@playwright/test';
import { AnlegenPage, type BookData } from './pages/AnlegenPage';
import { SuchePage } from './pages/SuchePage';

test.describe('Anlegen-Funktionalität', () => {
    // Jeder Test hier startet automatisch als eingeloggter Benutzer.

    test('sollte ein neues Buch erfolgreich anlegen und es in der Suche finden', async ({
        page,
    }) => {
        const anlegenPage = new AnlegenPage(page);

        // Eindeutige Testdaten generieren
        const testIsbn = `978-3-86490-${Math.floor(10000 + Math.random() * 90000)}-1`;
        const testTitel = `Das Testbuch der Winde ${new Date().getTime()}`;

        const buchDaten: BookData = {
            titel: testTitel,
            isbn: testIsbn,
            art: 'HARDCOVER',
            homepage: 'beispiel.com',
        };

        await anlegenPage.goto();
        await anlegenPage.createBook(buchDaten);

        // VERIFIZIERUNG: Weiterleitung checken
        await expect(page).toHaveURL(/.*\/suchen/);

        const suchePage = new SuchePage(page);
        await suchePage.searchByTitle(testTitel);

        const resultItems = suchePage.getResultItems();
        await expect(resultItems).toHaveCount(1);
        await expect(resultItems.first()).toContainText(testTitel);
    });

    test('sollte eine Fehlermeldung für eine ungültige ISBN anzeigen', async ({
        page,
    }) => {
        const anlegenPage = new AnlegenPage(page);

        await anlegenPage.goto();

        await anlegenPage.isbnInput.fill('123-ist-falsch');
        await anlegenPage.titelInput.click();

        const errorMessage = page.getByText(
            'ISBN ist ungültig. Bitte geben Sie eine gültige ISBN Nummer ein',
        );
        await expect(errorMessage).toBeVisible();

        // Der "Anlegen"-Button sollte deaktiviert sein
        await expect(anlegenPage.anlegenButton).toBeDisabled();
    });
});
