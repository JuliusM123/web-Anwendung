import type { Routes } from '@angular/router';
import { SucheComponent } from './suche/suche.component';
import { AnlegenComponent } from './anlegen/anlegen.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default-Route
    { path: 'home', component: HomeComponent }, // Home-Route
    { path: 'suchen', component: SucheComponent },
    { path: 'anlegen', component: AnlegenComponent },
    { path: 'login', component: LoginComponent },
    { path: '**', component: PageNotFoundComponent }, // Fallback-Route für nicht definierte Routen
];
