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
    changeDetection: ChangeDetectionStrategy.OnPush, // Optimiert die Änderungserkennung.
    selector: 'app-root', // Der CSS-Selektor für diese Komponente.
    standalone: true, // Markiert die Komponente als eigenständig.
    imports: [CommonModule, RouterOutlet, RouterLink], // Importiert benötigte Module für Routing und allgemeine Direktiven.
    templateUrl: './app.html', // Verweist auf die HTML-Template-Datei.
    styleUrl: './app.css', // Verweist auf die CSS-Styling-Datei.
})
export class AppComponent {
    /** Der Titel der Web-Anwendung. */
    title = 'web-Anwendung';
    /** Der `AuthService` wird injiziert, um auf Authentifizierungsfunktionen zugreifen zu können. */
    authService = inject(AuthService);
}
