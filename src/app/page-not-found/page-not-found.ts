import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Die `PageNotFoundComponent` ist eine einfache Komponente, die angezeigt wird,
 * wenn ein Benutzer versucht, auf eine nicht existierende Route zuzugreifen.
 * Sie nutzt die `OnPush` Change Detection Strategy für eine optimierte Leistung.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-page-not-found',
    standalone: true,
    imports: [],
    templateUrl: './page-not-found.html',
    styleUrls: ['./page-not-found.css'],
})
export class PageNotFoundComponent {}
