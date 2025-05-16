import { Routes } from '@angular/router';
import { SucheComponent } from './suche/suche.component';
import { AnlegenComponent } from './anlegen/anlegen.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {path: 'suchen', component: SucheComponent},
    {path: 'anlegen', component: AnlegenComponent},
    {path: 'login', component: LoginComponent},
];
