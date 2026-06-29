import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth/auth.service';

export type AdminTab = 'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores' | 'Banners' | 'Alterar Senha';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.scss'
})
export class AdminNavComponent {
  router = inject(Router);
  authService = inject(AuthService);

  activeTab = input.required<AdminTab>();
  tabChange = output<AdminTab>();

  isMenuOpen = signal(false);

  tabs: { label: AdminTab, icon: string }[] = [
    { label: 'Produtos', icon: 'fa-solid fa-box' },
    { label: 'Categorias de Produtos', icon: 'fa-solid fa-tags' },
    { label: 'Fornecedores', icon: 'fa-solid fa-truck-fast' },
    { label: 'Banners', icon: 'fa-solid fa-image' },
    { label: 'Usuários', icon: 'fa-solid fa-users' },
    { label: 'Alterar Senha', icon: 'fa-solid fa-lock' }
  ];

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  selectTab(tab: AdminTab) {
    this.tabChange.emit(tab);
    this.isMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
