import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

/**
 * @Component AppComponent
 * @description
 * The root component of the application.
 * It serves as the main entry point and container for other components and views.
 * Includes RouterOutlet for displaying routed components and RouterLink for navigation.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'web-Anwendung';
}
