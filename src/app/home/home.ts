import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TimeleftComponent } from './timeleft/timeleft';

@Component({
    selector: 'app-home',
    imports: [TimeleftComponent],
    templateUrl: './home.html',
    styleUrl: './home.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
