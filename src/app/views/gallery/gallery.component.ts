import {
  Component,
  inject,
  OnInit,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { InputComponent } from './../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { ItemCardGalleryComponent } from './components/item-card-gallery/item-card-gallery.component';
import { ModalGalleryComponent } from './components/modal-gallery/modal-gallery.component';

import { ProductsService } from '../../services/products/products.service';
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';
import { SuppliersService } from '../../services/suppliers/suppliers.service';
import { ProductRes } from '../../types/products/productRes.interface';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ItemCardGalleryComponent,
    ModalGalleryComponent,
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  private productsService = inject(ProductsService);
  private categoryService = inject(ProductCategoriesService);
  private supplierService = inject(SuppliersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderOptions = ['A-Z', 'Z-A'];

  selectedCategories = signal<string[]>([]);
  selectedSuppliers = signal<string[]>([]);
  currentPage = signal(0);
  selectedProduct = signal<ProductRes | null>(null);
  isModalOpen = signal(false);

  search = new FormControl('');
  orderBy = new FormControl('A-Z');

  categories = this.categoryService.productCategories;
  suppliers = this.supplierService.suppliers;
  products = this.productsService.productGallery;

  ngOnInit(): void {
    this.categoryService.getAll();
    this.supplierService.getAll();

    this.route.queryParams.subscribe((params) => {
      let cats = params['category'];
      let sups = params['supplier'];

      this.selectedCategories.set(cats ? (Array.isArray(cats) ? cats : [cats]) : []);
      this.selectedSuppliers.set(sups ? (Array.isArray(sups) ? sups : [sups]) : []);

      this.resetAndSearch();
    });

    this.search.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => this.resetAndSearch());

    this.orderBy.valueChanges.subscribe(() => this.resetAndSearch());
  }

  ngAfterViewInit() {
    this.initInfiniteScroll();
  }

  loadProducts(append: boolean) {
    const direction = this.orderBy.value === 'A-Z' ? 'ASC' : 'DESC';

    this.productsService.getGallery(
      {
        search: this.search.value,
        category: this.selectedCategories().length ? this.selectedCategories() : null,
        supplier: this.selectedSuppliers().length ? this.selectedSuppliers() : null,
        page: this.currentPage(),
        direction: direction,
      },
      append,
    );
  }

  resetAndSearch() {
    this.currentPage.set(0);
    this.loadProducts(false);
  }

  toggleCategory(slug: string) {
    const current = this.selectedCategories();
    const nextValue = current.includes(slug) ? current.filter(c => c !== slug) : [...current, slug];
    this.updateUrl('category', nextValue.length > 0 ? nextValue : null);
  }

  toggleSupplier(slug: string) {
    const current = this.selectedSuppliers();
    const nextValue = current.includes(slug) ? current.filter(s => s !== slug) : [...current, slug];
    this.updateUrl('supplier', nextValue.length > 0 ? nextValue : null);
  }

  private updateUrl(key: string, value: string[] | null) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value },
      queryParamsHandling: 'merge',
    });
  }

  private initInfiniteScroll() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !this.products().last &&
          this.products().content.length > 0
        ) {
          this.currentPage.update((p) => p + 1);
          this.loadProducts(true);
        }
      },
      { threshold: 1 },
    );

    observer.observe(this.scrollAnchor.nativeElement);
  }

  onOpenProductDetails(slug: string) {
    const product = this.products().content.find((p) => p.slug === slug);
    if (product) {
      this.selectedProduct.set(product);
      this.isModalOpen.set(true);
    }
  }

  onCloseModal() {
    this.isModalOpen.set(false);
    this.selectedProduct.set(null);
  }
}
