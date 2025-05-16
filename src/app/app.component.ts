import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SucheComponent } from './suche/suche.component';
import { AnlegenComponent } from './anlegen/anlegen.component';
import { LoginComponent } from './login/login.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        SucheComponent,
        AnlegenComponent,
        LoginComponent,
        RouterOutlet,
        RouterLink,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    title = 'web-Anwendung';
}
