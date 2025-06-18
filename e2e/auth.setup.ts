import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE } from '../playwright.config';
import { LoginPage } from './pages/LoginPage';

// Deine Login-Daten. Idealerweise aus einer sicheren Quelle wie Umgebungsvariablen.
const username = 'admin';
const password = 'p';

setup('Einmaliger Login und Speichern des Zustands', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(username, password);

    // Warten, bis der Logout-Button als Bestätigung für den Erfolg sichtbar ist.
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    // Speichere den eingeloggten Zustand (Cookies, Local Storage etc.) in die Datei.
    await page.context().storageState({ path: STORAGE_STATE });
});
