import { HttpClient } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    #httpClient = inject(HttpClient);

    username = '';
    password = '';
    
}
