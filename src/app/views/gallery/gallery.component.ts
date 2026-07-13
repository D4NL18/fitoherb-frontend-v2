import {
  Component,
  inject,
  OnInit,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
  computed,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { InputComponent } from './../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { ItemCardGalleryComponent } from './components/item-card-gallery/item-card-gallery.component';
import { ModalGalleryComponent } from './components/modal-gallery/modal-gallery.component';
import { SkeletonCardComponent } from '../../shared/skeleton-card/skeleton-card.component';

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
    SkeletonCardComponent,
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  @ViewChild('productsGrid') productsGrid!: ElementRef;
  @ViewChild('suppliersBtn') suppliersBtn!: ElementRef;
  @ViewChild('suppliersPanel') suppliersPanel!: ElementRef;

  private productsService = inject(ProductsService);
  private categoryService = inject(ProductCategoriesService);
  private supplierService = inject(SuppliersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  selectedCategories = signal<string[]>([]);
  selectedSuppliers = signal<string[]>([]);
  currentPage = signal(0);
  selectedProduct = signal<ProductRes | null>(null);
  isModalOpen = signal(false);

  categoriesExpanded = signal(true);
  suppliersExpanded = signal(false);

  search = new FormControl('');

  categories = this.categoryService.productCategories;
  suppliers = this.supplierService.suppliers;
  products = this.productsService.productGallery;
  isLoading = this.productsService.isGalleryLoading;

  selectedIndex = computed(() => {
    const p = this.selectedProduct();
    if (!p) return -1;
    return this.products().content.findIndex(x => x.slug === p.slug);
  });

  hasPrevProduct = computed(() => this.selectedIndex() > 0);

  hasNextProduct = computed(() => {
    const idx = this.selectedIndex();
    return idx >= 0 && (idx < this.products().content.length - 1 || !this.products().last);
  });

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
  }

  ngAfterViewInit() {
    this.initInfiniteScroll();
  }

  loadProducts(append: boolean, onSuccess?: () => void) {
    const size = this.calculatePageSize();

    this.productsService.getGallery(
      {
        search: this.search.value,
        category: this.selectedCategories().length ? this.selectedCategories() : null,
        supplier: this.selectedSuppliers().length ? this.selectedSuppliers() : null,
        page: this.currentPage(),
        size: size,
        pageSize: size,
        limit: size,
        per_page: size
      },
      append,
      onSuccess
    );
  }

  private calculatePageSize(): number {
    if (!this.productsGrid) return 16;

    const gridEl = this.productsGrid.nativeElement as HTMLElement;
    const gridWidth = gridEl.clientWidth;
    if (gridWidth === 0) return 16;

    const minColWidth = 300;
    const gap = 32;

    const columns = Math.floor((gridWidth + gap) / (minColWidth + gap));
    const safeColumns = Math.max(1, columns);

    return safeColumns * Math.ceil(16 / safeColumns);
  }

  resetAndSearch() {
    this.currentPage.set(0);
    this.loadProducts(false);
  }

  toggleCategory(slug: string) {
    const current = this.selectedCategories();
    const nextValue = current.includes(slug) ? current.filter(c => c !== slug) : [...current, slug];
    this.selectedCategories.set(nextValue);
    this.updateUrl('category', nextValue.length > 0 ? nextValue : null);
    this.resetAndSearch();
  }

  toggleSupplier(slug: string) {
    const current = this.selectedSuppliers();
    const nextValue = current.includes(slug) ? current.filter(s => s !== slug) : [...current, slug];
    this.selectedSuppliers.set(nextValue);
    this.updateUrl('supplier', nextValue.length > 0 ? nextValue : null);
    this.resetAndSearch();
  }

  toggleCategoriesExpand() {
    this.categoriesExpanded.update(v => !v);
  }

  toggleSuppliersExpand() {
    this.suppliersExpanded.update(v => !v);
  }

  toggleSuppliersPanel() {
    this.suppliersExpanded.update(v => !v);
  }

  clearCategories() {
    this.selectedCategories.set([]);
    this.updateUrl('category', null);
    this.resetAndSearch();
  }

  clearAllFilters() {
    this.search.setValue('', { emitEvent: false });
    this.selectedCategories.set([]);
    this.selectedSuppliers.set([]);

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: { category: null, supplier: null },
      queryParamsHandling: 'merge',
    });
    this.location.replaceState(this.router.serializeUrl(urlTree));

    this.resetAndSearch();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.suppliersExpanded()) {
      const target = event.target as HTMLElement;
      if (
        this.suppliersBtn &&
        !this.suppliersBtn.nativeElement.contains(target) &&
        this.suppliersPanel &&
        !this.suppliersPanel.nativeElement.contains(target)
      ) {
        this.suppliersExpanded.set(false);
      }
    }
  }

  private updateUrl(key: string, value: string[] | null) {
    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: { [key]: value },
      queryParamsHandling: 'merge',
    });
    this.location.replaceState(this.router.serializeUrl(urlTree));
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

  navigateProduct(direction: 1 | -1) {
    const idx = this.selectedIndex();
    if (idx < 0) return;
    const newIdx = idx + direction;
    
    if (newIdx >= 0 && newIdx < this.products().content.length) {
      this.selectedProduct.set(this.products().content[newIdx]);
    } else if (direction === 1 && !this.products().last && !this.isLoading()) {
      this.currentPage.update((p) => p + 1);
      this.loadProducts(true, () => {
        if (newIdx < this.products().content.length) {
          this.selectedProduct.set(this.products().content[newIdx]);
        }
      });
    }
  }
}
