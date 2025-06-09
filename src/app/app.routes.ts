import type { Routes } from '@angular/router';
import { SucheComponent } from './suche/suche';
import { AnlegenComponent } from './anlegen/anlegen';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { PageNotFoundComponent } from './page-not-found/page-not-found';

/**
 * @constant routes
 * @description
 * Defines the application's routes.
 * Includes paths for home, search, create (anlegen), login, and a fallback for page not found.
 * The default route redirects to 'home'.
 * @type {Routes}
 */
export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default-Route
    { path: 'home', component: HomeComponent }, // Home-Route
    { path: 'suchen', component: SucheComponent },
    { path: 'anlegen', component: AnlegenComponent },
    { path: 'login', component: LoginComponent },
    { path: '**', component: PageNotFoundComponent }, // Fallback-Route für nicht definierte Routen
];
