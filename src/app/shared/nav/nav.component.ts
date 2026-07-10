import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  isMenuOpen = false;
  isProductsDropdownOpen = false;

  private categoryService = inject(ProductCategoriesService);
  categories = this.categoryService.productCategories;

  ngOnInit() {
    this.categoryService.getAll();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.isProductsDropdownOpen = false;
  }

  toggleProductsDropdown(event: Event) {
    event.preventDefault();
    this.isProductsDropdownOpen = !this.isProductsDropdownOpen;
  }
}
