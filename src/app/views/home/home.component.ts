import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  computed,
  ViewChild,
} from '@angular/core';
import { BannerCarouselComponent } from './components/banner-carousel/banner-carousel.component';
import { Suppliers3dCarouselComponent } from './components/suppliers-3d-carousel/suppliers-3d-carousel.component';
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';
import { SuppliersService } from '../../services/suppliers/suppliers.service';
import { environment } from '../../../environments/environment';
import { ButtonComponent } from '../../shared/button/button.component';
import { BentoHoverDirective } from '../../shared/directives/bento-hover.directive';
import { ClipPathRevealDirective } from '../../shared/directives/clip-path-reveal.directive';
import { DotGridReactiveDirective } from '../../shared/directives/dot-grid-reactive.directive';
import { MagneticButtonDirective } from '../../shared/directives/magnetic-button.directive';
import { SplitTextRevealDirective } from '../../shared/directives/split-text-reveal.directive';
import { Router } from '@angular/router';
import { calculateFitoherbYears } from '../../shared/utils/company-age.util';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BannerCarouselComponent, Suppliers3dCarouselComponent, ButtonComponent, BentoHoverDirective, ClipPathRevealDirective, DotGridReactiveDirective, MagneticButtonDirective, SplitTextRevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  private productCategoriesService = inject(ProductCategoriesService);
  private suppliersService = inject(SuppliersService);
  private router = inject(Router);

  @ViewChild('aboutSection') aboutSection!: ElementRef;
  @ViewChild('statsContainer') statsContainer!: ElementRef;
  @ViewChild('productsSection') productsSection!: ElementRef;
  @ViewChild('suppliersSection') suppliersSection!: ElementRef;
  @ViewChild('contactSection') contactSection!: ElementRef;

  readonly companyYears = calculateFitoherbYears();

  stats = {
    products: signal(0),
    years: signal(0),
    clients: signal(0),
  };

  private animatedStats = false;

  public backendUrl = environment.imagesBaseUrl;

  public productCategories = computed(() => {
    return this.productCategoriesService.productCategories().map(c => {
      let url = c.imageUrl;
      if (url && !url.startsWith('http') && !url.startsWith('assets/')) {
        if (this.backendUrl.includes('storage.googleapis.com')) {
          url = url.replace(/^\/?uploads\/?/, '/');
        }
        url = this.backendUrl + (url.startsWith('/') ? '' : '/') + url;
      }
      return { ...c, imageUrl: url };
    });
  });

  public featuredSuppliers = computed(() => {
    return [...this.suppliersService.suppliers()]
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
      .slice(0, 12)
      .map(s => {
        let url = s.imageUrl;
        if (
          url &&
          !url.startsWith('http') &&
          !url.startsWith('assets/') &&
          !url.startsWith('/assets/')
        ) {
          if (this.backendUrl.includes('storage.googleapis.com')) {
            url = url.replace(/^\/?uploads\/?/, '/');
          }
          url = this.backendUrl + (url.startsWith('/') ? '' : '/') + url;
        }
        return {
          ...s,
          imageUrl: url || '/assets/images/fitoherb-leaf-icon.png',
        };
      });
  });

  ngOnInit(): void {
    this.productCategoriesService.getAll();
    this.suppliersService.getAll();
  }

  ngAfterViewInit() {
    this.initScrollObserver();
  }

  goToProducts() {
    this.router.navigate(['/produtos']);
  }

  goToSuppliers() {
    this.router.navigate(['/fornecedores']);
  }

  goToCategory(slug: string) {
    this.router.navigate(['/produtos'], { queryParams: { category: slug } });
  }

  goToContact() {
    this.router.navigate(['/contato']);
  }

  goToAbout() {
    this.router.navigate(['/quem-somos']);
  }

  private initScrollObserver() {
    const options = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, options);

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.animatedStats) {
            this.animateNumbers();
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (this.statsContainer) {
      statsObserver.observe(this.statsContainer.nativeElement);
    }

    observer.observe(this.aboutSection.nativeElement);
    observer.observe(this.productsSection.nativeElement);
    observer.observe(this.suppliersSection.nativeElement);
    observer.observe(this.contactSection.nativeElement);
  }

  private animateNumbers() {
    this.animatedStats = true;
    const duration = 1200;

    this.counter(1800, 'products', duration);
    this.counter(this.companyYears, 'years', duration);
    this.counter(2000, 'clients', duration);
  }

  private counter(
    endValue: number,
    key: keyof typeof this.stats,
    duration: number,
  ) {
    let start = 0;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    const increment = endValue / totalFrames;
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;

      const currentValue = Math.round(increment * currentFrame);

      if (currentFrame <= totalFrames) {
        this.stats[key].set(currentValue);
      } else {
        this.stats[key].set(endValue);
        clearInterval(timer);
      }
    }, frameRate);
  }
}
