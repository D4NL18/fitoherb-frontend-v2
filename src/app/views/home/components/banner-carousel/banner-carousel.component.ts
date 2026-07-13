import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BannersService } from '../../../../services/banners/banners.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-carousel.component.html',
  styleUrl: './banner-carousel.component.scss'
})
export class BannerCarouselComponent implements OnInit, OnDestroy {
  bannersService = inject(BannersService);

  originalImages: string[] = [];

  displayImages: string[] = [];

  currentIndex = 1;
  isTransitioning = false;
  transitionTime = 0.5;
  currentTranslate = -100;
  prevTranslate = -100;

  isDragging = false;
  startX = 0;

  autoplayInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      const banners = this.bannersService.activeBanners();
      const baseUrl = environment.imagesBaseUrl;
      
      if (banners.length > 0) {
        this.originalImages = banners.map(b => {
          let url = b.imagePath;
          if (url && !url.startsWith('http')) {
            url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
          }
          return url;
        });
      } else {
        this.originalImages = [
          '/assets/images/banner/Banner-image-1.jpg',
          '/assets/images/banner/Banner-image-2.jpg',
          '/assets/images/banner/Banner-image-3.jpg',
          '/assets/images/banner/Banner-image-4.jpg',
          '/assets/images/banner/Banner-image-5.jpg'
        ];
      }

      if (this.originalImages.length > 0) {
        const first = this.originalImages[0];
        const last = this.originalImages[this.originalImages.length - 1];
        this.displayImages = [last, ...this.originalImages, first];
        this.updateCarousel(false);
      }
    });
  }

  ngOnInit() {
    this.bannersService.getActive();
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    if (isPlatformBrowser(this.platformId)) {
      this.autoplayInterval = setInterval(() => {
        this.next();
      }, 8000);
    }
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  next() {
    if (this.isTransitioning) return;
    this.currentIndex++;
    this.updateCarousel(true);
  }

  prev() {
    if (this.isTransitioning) return;
    this.currentIndex--;
    this.updateCarousel(true);
  }

  updateCarousel(withTransition: boolean) {
    this.isTransitioning = withTransition;
    this.transitionTime = withTransition ? 0.5 : 0;
    this.currentTranslate = -this.currentIndex * 100;
    this.prevTranslate = this.currentTranslate;
  }

  onTransitionEnd() {
    this.isTransitioning = false;

    if (this.currentIndex === 0) {
      this.currentIndex = this.originalImages.length;
      this.updateCarousel(false);
    }
    else if (this.currentIndex === this.displayImages.length - 1) {
      this.currentIndex = 1;
      this.updateCarousel(false);
    }
  }

  onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.isTransitioning = false;
    this.stopAutoplay();
    this.startX = this.getPositionX(event);
  }

  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    const currentPosition = this.getPositionX(event);
    const diff = currentPosition - this.startX;

    const diffPercent = (diff / window.innerWidth) * 100;
    this.currentTranslate = this.prevTranslate + diffPercent;
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const movedBy = this.currentTranslate - this.prevTranslate;

    if (movedBy < -10) {
      this.next();
    } else if (movedBy > 10) {
      this.prev();
    } else {
      this.updateCarousel(true);
    }

    this.startAutoplay();
  }

  private getPositionX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.pageX : event.touches[0].clientX;
  }

  @HostListener('window:mouseup')
  onWindowMouseUp() {
    if (this.isDragging) this.onDragEnd();
  }

  onMouseEnter() {
    this.stopAutoplay();
  }

  onMouseLeave() {
    if (this.isDragging) {
      this.onDragEnd();
    } else {
      this.startAutoplay();
    }
  }
}
