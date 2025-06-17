import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Login-Funktionalität', () => {
    test('sollte einen Benutzer erfolgreich einloggen', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.goto();
        await loginPage.login('admin', 'p');

        const logoutButton = page.getByRole('button', { name: 'Logout' });

        await expect(logoutButton).toBeVisible();
    });

    test('sollte eine Fehlermeldung bei falschen Anmeldedaten anzeigen', async ({
        page,
    }) => {
        const loginPage = new LoginPage(page);

        await loginPage.goto();
        await loginPage.login('falscher-user', 'falsches-passwort');

        const errorDialog = page.getByRole('dialog');

        await expect(errorDialog).toBeVisible();
        await expect(errorDialog).toContainText('Login fehlgeschlagen!');
    });
});
