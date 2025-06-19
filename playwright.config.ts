import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// Wir definieren hier den Pfad zur Speicherdatei, damit wir ihn wiederverwenden können.
// eslint-disable-next-line unicorn/prefer-module
export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env['CI'],
    retries: process.env['CI'] ? 2 : 0,
    workers: process.env['CI'] ? 1 : undefined,
    reporter: 'html',

    use: {
        baseURL: 'https://localhost:4200',
        ignoreHTTPSErrors: true,
        trace: 'on', // 'on' ist am besten zum Debuggen
        video: 'retain-on-failure',
    },

    projects: [
        /* Projekt 1: Das Setup. Es wird immer zuerst ausgeführt. */
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },

        /* Projekt 2: Chromium. Hängt vom Setup ab. */
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Lade den gespeicherten Zustand vor jedem Test in diesem Projekt.
                storageState: STORAGE_STATE,
            },
            dependencies: ['setup'],
        },
    ],
});
