import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

/**
 * Startet die Angular-Anwendung.
 *
 * Diese Datei ist der Einstiegspunkt der Anwendung. Sie bootstrappt die
 * {@link AppComponent} und verwendet die in {@link appConfig} definierten
 * Konfigurationen.
 *
 * Wenn beim Starten der Anwendung ein Fehler auftritt, wird dieser in der Konsole ausgegeben.
 */
try {
    await bootstrapApplication(AppComponent, appConfig);
} catch (error) {
    console.error(error);
}
