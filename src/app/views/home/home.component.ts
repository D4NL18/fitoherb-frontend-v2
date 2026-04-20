import { Component, inject } from '@angular/core';
import { BannerCarouselComponent } from './components/banner-carousel/banner-carousel.component';
import { ProductCategoryRes } from '../../types/product-categories/productCategoriesRes.interface';
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BannerCarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  private productCategoriesService = inject(ProductCategoriesService);

  public backendUrl = environment.apiUrl;

  ngOnInit(): void {
    this.getAllProductCategories();
  }

  productCategoriesList: ProductCategoryRes[] = [];

  getAllProductCategories(): void {
    this.productCategoriesService.getAll().subscribe({
      next: (res) => {
        this.productCategoriesList = res;
        console.log(res)
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
