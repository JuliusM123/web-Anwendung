import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE } from '../playwright.config';
import { LoginPage } from './pages/LoginPage';

const username = 'admin';
const password = 'p';

setup('Einmaliger Login und Speichern des Zustands', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(username, password);

    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    await page.context().storageState({ path: STORAGE_STATE });
});
