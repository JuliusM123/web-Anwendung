import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object für die Login-Seite (/login).
 */
export class LoginPage {
    readonly page: Page;

    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.getByPlaceholder('Username');
        this.passwordInput = page.getByPlaceholder('Password');
        this.loginButton = page
            .locator('app-login')
            .getByRole('button', { name: 'Login' });
    }

    /**
     * Navigiert direkt zur Login-Seite der Anwendung.
     */
    async goto() {
        await this.page.goto('/login');
    }

    /**
     * Führt einen kompletten Login-Vorgang aus.
     * @param admin Der Benutzername für den Login.
     * @param p Das Passwort für den Login.
     */
    async login(username: string, password?: string) {
        await this.usernameInput.fill(username);
        if (password) {
            await this.passwordInput.fill(password);
        }
        await this.loginButton.click();
        await expect(this.page).toHaveTitle('Web-Anwendung');
    }
}
