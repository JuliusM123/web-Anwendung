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
    standalone: true,
    imports: [TimeleftComponent],
    templateUrl: './home.html',
    styleUrl: './home.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
