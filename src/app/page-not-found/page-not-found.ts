import { Component, ChangeDetectionStrategy } from '@angular/core';
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-page-not-found',
    standalone: true,
    imports: [],
    templateUrl: './page-not-found.html',
    styleUrl: './page-not-found.css',
})
export class PageNotFoundComponent {}
