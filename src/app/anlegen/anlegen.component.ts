import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,selector: 'app-anlegen',
    standalone: true,
    imports: [],
    templateUrl: './anlegen.component.html',
    styleUrl: './anlegen.component.css',
})
export class AnlegenComponent {}
