import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../../services/token/token.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [],
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.scss'
})
export class AdminNavComponent {

  router = inject(Router);
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
