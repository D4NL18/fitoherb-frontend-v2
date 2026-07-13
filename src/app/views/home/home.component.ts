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
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';
import { environment } from '../../../environments/environment';
import { ButtonComponent } from '../../shared/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BannerCarouselComponent, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  private productCategoriesService = inject(ProductCategoriesService);
  private router = inject(Router);

  @ViewChild('aboutSection') aboutSection!: ElementRef;
  @ViewChild('productsSection') productsSection!: ElementRef;
  @ViewChild('contactSection') contactSection!: ElementRef;

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
        url = this.backendUrl + (url.startsWith('/') ? '' : '/') + url;
      }
      return { ...c, imageUrl: url };
    });
  });

  ngOnInit(): void {
    this.productCategoriesService.getAll();
  }

  ngAfterViewInit() {
    this.initScrollObserver();
  }

  goToProducts() {
    this.router.navigate(['/produtos']);
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

          if (
            entry.target === this.aboutSection.nativeElement &&
            !this.animatedStats
          ) {
            this.animateNumbers();
          }
        }
      });
    }, options);

    observer.observe(this.aboutSection.nativeElement);
    observer.observe(this.productsSection.nativeElement);
    observer.observe(this.contactSection.nativeElement);
  }

  private animateNumbers() {
    this.animatedStats = true;
    const fastDuration = 800;

    this.counter(500, 'products', fastDuration);
    this.counter(12, 'years', fastDuration);
    this.counter(150, 'clients', fastDuration);
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
