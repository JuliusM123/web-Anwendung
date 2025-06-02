import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TimeleftComponent } from './timeleft/timeleft.component';

@Component({
    selector: 'app-home',
    imports: [TimeleftComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
