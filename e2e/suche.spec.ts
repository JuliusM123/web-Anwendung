import { test, expect } from '@playwright/test';
import { SuchePage } from './pages/SuchePage';

test.describe('Suche-Funktionalität', () => {
    test('sollte bei einer gültigen Suche Bücher finden und anzeigen', async ({
        page,
    }) => {
        const suchePage = new SuchePage(page);
        const suchbegriff = 'Phi';

        await suchePage.goto();
        await suchePage.searchByTitle(suchbegriff);

        await expect(suchePage.resultsList).toBeVisible();

        await expect(suchePage.noResultsMessage).not.toBeVisible();

        const resultItems = suchePage.getResultItems();
        await expect(resultItems.first()).toBeVisible();

        await expect(resultItems.first()).toContainText(suchbegriff);
    });

    test('sollte eine Meldung anzeigen, wenn keine Bücher gefunden werden', async ({
        page,
    }) => {
        const suchePage = new SuchePage(page);
        const nonExistentTitle = 'EinBuchtitelDenEsGarantiertNichtGibt12345';

        await suchePage.goto();
        await suchePage.searchByTitle(nonExistentTitle);

        await expect(suchePage.noResultsMessage).toBeVisible();

        await expect(suchePage.resultsList).not.toBeVisible();
    });
});
