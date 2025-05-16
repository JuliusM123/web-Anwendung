import { Routes } from '@angular/router';
import { SucheComponent } from './suche/suche.component';
import { AnlegenComponent } from './anlegen/anlegen.component';

export const routes: Routes = [
    {path: 'suchen', component: SucheComponent},
    {path: 'anlegen', component: AnlegenComponent},
];
