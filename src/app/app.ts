import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './service/auth.service';

/**
 * Die `AppComponent` ist die Wurzelkomponente der Anwendung.
 * Sie dient als Layout-Container für die Hauptnavigation und die gerouteten Inhalte.
 * Die `OnPush` Change Detection Strategy wird verwendet, um die Performance zu optimieren.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class AppComponent {
    /** Der Titel der Web-Anwendung. */
    title = 'web-Anwendung';
    /** Der `AuthService` wird injiziert, um auf Authentifizierungsfunktionen zugreifen zu können. */
    authService = inject(AuthService);
}
