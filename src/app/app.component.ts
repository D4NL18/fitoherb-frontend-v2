import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/nav/nav.component';
import { FooterComponent } from "./shared/footer/footer.component";
import { filter } from 'rxjs';
import { CommonModule } from "../../node_modules/@angular/common/index";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, FooterComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private router = inject(Router);

  showLayout = signal(true);

  private hideLayoutRoutes = ['/login', '/admin'];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const isHidden = this.hideLayoutRoutes.some(route =>
        this.router.url.startsWith(route)
      );

      this.showLayout.set(!isHidden);
    });
  }
}
