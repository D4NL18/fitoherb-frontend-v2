import { Component, inject, OnInit } from '@angular/core';
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';
import { ProductCategoryRes } from '../../types/product-categories/productCategoriesRes.interface';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {

  private productCategoriesService = inject(ProductCategoriesService);

  ngOnInit(): void {
    this.productCategoriesService.getAll();
  }

  public productCategories = this.productCategoriesService.productCategories;

}
