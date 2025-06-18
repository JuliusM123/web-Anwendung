import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TimeleftComponent } from './timeleft/timeleft';

/**
 * Die `HomeComponent` ist die Hauptkomponente für die Startseite der Anwendung.
 * Sie dient als Container für andere Komponenten, wie z.B. die `TimeleftComponent`.
 * Die Änderungserkennungsstrategie ist auf `OnPush` gesetzt,
 * um die Performance durch optimierte Renderzyklen zu verbessern.
 */
@Component({
    selector: 'app-home',
    standalone: true, // Markiert die Komponente als eigenständig.
    imports: [TimeleftComponent], // Importiert die benötigte `TimeleftComponent`.
    templateUrl: './home.html', // Verweist auf die HTML-Template-Datei.
    styleUrl: './home.css', // Verweist auf die CSS-Styling-Datei.
    changeDetection: ChangeDetectionStrategy.OnPush, // Optimiert die Änderungserkennung.
})
export class HomeComponent {}