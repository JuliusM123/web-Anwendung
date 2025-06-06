import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import type { ElementRef } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import type { TokenResponse } from '../service/auth.service';
import { AuthService } from '../service/auth.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-login',
    standalone: true,
    imports: [
        FormsModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    #httpClient = inject(HttpClient);
    #router = inject(Router);
    #authService = inject(AuthService);
    
    @ViewChild('errorModal') errorModal!: ElementRef<HTMLDialogElement>;
    @ViewChild('successModal') successModal!: ElementRef<HTMLDialogElement>;

    username = '';
    password = '';
    loginErrorMessage = '';
    error: HttpErrorResponse | null = null;
    responseStatus: number | null = null;

    async login() {
        
        console.log('Login attempt with:', this.username, this.password);
        const loginData = {
            username: this.username,
            password: this.password
        };
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        const url = 'https://localhost:3000/auth/token';

        try {
             const response = await firstValueFrom(
            this.#httpClient.post<TokenResponse>(url, loginData, { headers })
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
            if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
                this.loginErrorMessage = 'Benutzername oder Passwort ist falsch.';
            } else {
                this.loginErrorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
            }
            const modal = this.errorModal?.nativeElement;
            if (modal instanceof HTMLDialogElement) {
                modal.showModal();
            }
        }
    }
}
