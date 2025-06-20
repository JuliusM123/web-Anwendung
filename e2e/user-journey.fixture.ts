import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { SuchePage } from './pages/SuchePage';
import { AnlegenPage } from './pages/AnlegenPage';

interface UserJourneyFixtures {
    loginPage: LoginPage;
    suchePage: SuchePage;
    anlegenPage: AnlegenPage;
}

export const test = base.extend<UserJourneyFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    suchePage: async ({ page }, use) => {
        await use(new SuchePage(page));
    },
    anlegenPage: async ({ page }, use) => {
        await use(new AnlegenPage(page));
    },
});

export { expect } from '@playwright/test';
