import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';
import { calculateFitoherbYears } from '../utils/company-age.util';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, AfterViewInit {
  private readonly productCategoriesService = inject(ProductCategoriesService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('footerEl') footerEl?: ElementRef<HTMLElement>;

  private observer: IntersectionObserver | null = null;
  private tween: gsap.core.Tween | null = null;

  public productCategories = this.productCategoriesService.productCategories;
  readonly companyYears = calculateFitoherbYears();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
      this.tween?.kill();
      this.tween = null;
    });
  }

  ngOnInit(): void {
    this.productCategoriesService.getAll();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const footer = this.footerEl?.nativeElement;
    if (!footer || !('IntersectionObserver' in window)) return;

    this.ngZone.runOutsideAngular(() => {
      const items = Array.from(footer.querySelectorAll<HTMLElement>(':scope > section, :scope > .copyright'));
      if (items.length === 0) return;

      gsap.set(items, { opacity: 0, y: 28 });

      this.observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          this.observer?.disconnect();
          this.observer = null;
          this.tween = gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power3.out',
            stagger: 0.08,
            clearProps: 'transform,opacity',
          });
        },
        { threshold: 0.08 }
      );
      this.observer.observe(footer);
    });
  }
}
