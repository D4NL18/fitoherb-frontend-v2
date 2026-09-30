import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth/auth.service';

export type AdminTab = 'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores' | 'Banners' | 'Rotas' | 'Alterar Senha';

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
  userRole = input<'ADMIN' | 'USER' | 'SELLER' | null>(null);
  tabChange = output<AdminTab>();

  isMenuOpen = signal(false);

  private readonly adminTabs: { label: AdminTab, icon: string }[] = [
    { label: 'Produtos', icon: 'fa-solid fa-box' },
    { label: 'Categorias de Produtos', icon: 'fa-solid fa-tags' },
    { label: 'Fornecedores', icon: 'fa-solid fa-truck-fast' },
    { label: 'Banners', icon: 'fa-solid fa-image' },
    { label: 'Usuários', icon: 'fa-solid fa-users' },
    { label: 'Rotas', icon: 'fa-solid fa-route' },
    { label: 'Alterar Senha', icon: 'fa-solid fa-lock' }
  ];

  private readonly userTabs: { label: AdminTab, icon: string }[] = [
    { label: 'Produtos', icon: 'fa-solid fa-box' },
    { label: 'Categorias de Produtos', icon: 'fa-solid fa-tags' },
    { label: 'Fornecedores', icon: 'fa-solid fa-truck-fast' },
    { label: 'Banners', icon: 'fa-solid fa-image' },
    { label: 'Alterar Senha', icon: 'fa-solid fa-lock' }
  ];

  private readonly sellerTabs: { label: AdminTab, icon: string }[] = [
    { label: 'Rotas', icon: 'fa-solid fa-route' },
    { label: 'Alterar Senha', icon: 'fa-solid fa-lock' }
  ];

  // Regras P-100 e P-107:
  // - Vendedor (SELLER): Rotas e Alterar Senha
  // - Usuário (USER): Acesso aos CRUDs (Produtos, Categorias, Fornecedores, Banners) e Alterar Senha
  // - Administrador (ADMIN): Acesso total a todas as abas
  tabs = computed(() => {
    const role = this.userRole();
    if (role === 'SELLER') {
      return this.sellerTabs;
    }
    if (role === 'USER') {
      return this.userTabs;
    }
    return this.adminTabs;
  });

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
