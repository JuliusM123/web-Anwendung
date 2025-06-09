import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './service/auth.service';

/**
 * @Component AppComponent
 * @description
 * The root component of the application.
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
    title = 'web-Anwendung';
    authService = inject(AuthService);

    openLogoutPopup(): void {
        if (confirm('Möchtest du dich wirklich ausloggen?')) {
            this.authService.logout();
        }
    }
}
