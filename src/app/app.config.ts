import type { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

/**
 * @constant appConfig
 * @description
 * Defines the application's root configuration for standalone Angular applications.
 * It sets up essential providers for routing, HTTP client functionality,
 * and zone change detection.
 * @type {ApplicationConfig}
 */
export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }), // Configures zone.js change detection
        provideRouter(routes), // Provides the application routes
        provideHttpClient(withFetch()), // Configures HttpClient to use the fetch API
    ],
};
