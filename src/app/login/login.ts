import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import type { ElementRef } from '@angular/core';
import {
    Component,
    ChangeDetectionStrategy,
    inject,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import type { TokenResponse } from '../service/auth.service';
import { AuthService } from '../service/auth.service';

/**
 * Der `LoginComponent` ist für die Benutzeranmeldung zuständig.
 * Er verwaltet die Benutzereingaben für Benutzername und Passwort,
 * kommuniziert mit dem Authentifizierungsdienst und zeigt dem Benutzer Feedback
 * über den Erfolg oder Misserfolg des Anmeldevorgangs.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class LoginComponent {
    /** HTTP-Client für Anfragen an das Backend. */
    #httpClient = inject(HttpClient);
    /** Router für die Navigation nach dem Login. */
    #router = inject(Router);
    /** Authentifizierungsdienst zur Verwaltung der Anmeldelogik. */
    #authService = inject(AuthService);

    /** Referenz auf das HTML-Dialogelement für Fehlermeldungen. */
    @ViewChild('errorModal') errorModal!: ElementRef<HTMLDialogElement>;
    /** Referenz auf das HTML-Dialogelement für Erfolgsmeldungen. */
    @ViewChild('successModal') successModal!: ElementRef<HTMLDialogElement>;

    /** Das eingegebene Benutzername. */
    username = '';
    /** Das eingegebene Passwort. */
    password = '';
    /** Die Fehlermeldung, die dem Benutzer angezeigt wird. */
    loginErrorMessage = '';
    /** Speichert die HTTP-Fehlerantwort, falls ein Fehler auftritt. */
    error: HttpErrorResponse | null = null;
    /** Der HTTP-Antwortstatuscode. */
    responseStatus: number | null = null;

    /**
     * Führt den Anmeldevorgang aus.
     * Sendet die Anmeldedaten an den Server, verarbeitet die Antwort
     * und zeigt entsprechende Modal-Dialoge an. Bei Erfolg wird der Benutzer
     * zur Startseite weitergeleitet.
     */
    async login() {
        console.log('Login attempt with:', this.username);
        const loginData = {
            username: this.username,
            password: this.password,
        };

        const url = 'https://localhost:3000/auth/token';

        try {
            const response = await firstValueFrom(
                this.#httpClient.post<TokenResponse>(url, loginData),
            );

            if (response?.access_token && response?.refresh_token) {
                this.#authService.loginSuccess(response);

                this.successModal.nativeElement.showModal();
                setTimeout(() => {
                    this.successModal.nativeElement.close();
                    void this.#router.navigate(['/home']);
                }, 1000);
            }
        } catch (err) {
            if (
                err instanceof HttpErrorResponse &&
                (err.status === 401 || err.status === 403)
            ) {
                this.loginErrorMessage =
                    'Benutzername oder Passwort ist falsch.';
            } else {
                this.loginErrorMessage =
                    'Ein unerwarteter Fehler ist aufgetreten.';
            }
            const modal = this.errorModal?.nativeElement;
            if (modal instanceof HTMLDialogElement) {
                modal.showModal();
            }
        }
    }
}
