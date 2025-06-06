import { HttpErrorResponse} from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

const url = 'https://localhost:3000/auth/token';

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

    username = '';
    password = '';
    error: HttpErrorResponse | null = null;
    responseStatus: number | null = null;

async login() {
    const loginData = {
        username: this.username,
        password: this.password
    };
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
    });

    try {
        const response = await firstValueFrom(
            this.#httpClient.post(url, loginData, { observe: 'response', headers })
        );

        this.responseStatus = response.status;
        this.error = null;
        console.log('Login successful:', response);

    } catch (err) {
        if (err instanceof HttpErrorResponse) {
            this.responseStatus = err.status;
            this.error = err;
            console.error('Login failed:', err);
        } else {
            console.error('An unexpected error occurred:', err);
        }
    }
}
    
}
