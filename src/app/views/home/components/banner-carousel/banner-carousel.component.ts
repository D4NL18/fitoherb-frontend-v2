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
  isResetting = false;

  isDragging = false;
  startX = 0;

  autoplayInterval: any;
  isLoading = true;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      const banners = this.bannersService.activeBanners();
      const baseUrl = environment.imagesBaseUrl;
      
      this.isLoading = this.bannersService.isLoading();

      if (!this.isLoading) {
        if (banners.length > 0) {
          this.originalImages = banners.map(b => {
            let url = b.imagePath;
            if (url && !url.startsWith('http') && !url.startsWith('assets/')) {
              url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
            }
            return url;
          });
        } else {
          this.originalImages = [];
        }

        if (this.originalImages.length > 0) {
          const first = this.originalImages[0];
          const last = this.originalImages[this.originalImages.length - 1];
          this.displayImages = [last, ...this.originalImages, first];
          this.currentIndex = 1;
          this.updateCarousel(false);
          this.stopAutoplay();
          this.startAutoplay();
        } else {
          this.displayImages = [];
        }
      }
    });
  }

  ngOnInit() {
    this.bannersService.getActive();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.stopAutoplay();
    if (isPlatformBrowser(this.platformId) && this.originalImages.length > 1) {
      this.autoplayInterval = setInterval(() => {
        this.next();
      }, 10000);
    }
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  next() {
    if (this.isTransitioning || this.isResetting || this.originalImages.length <= 1) return;
    this.currentIndex++;
    this.updateCarousel(true);
  }

  prev() {
    if (this.isTransitioning || this.isResetting || this.originalImages.length <= 1) return;
    this.currentIndex--;
    this.updateCarousel(true);
  }

  updateCarousel(withTransition: boolean) {
    this.isTransitioning = withTransition;
    this.transitionTime = withTransition ? 0.5 : 0;
    this.currentTranslate = -this.currentIndex * 100;
    this.prevTranslate = this.currentTranslate;
  }

  onTransitionEnd(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }

    if (this.currentIndex <= 0) {
      this.isResetting = true;
      this.currentIndex = this.originalImages.length;
      this.updateCarousel(false);
    } else if (this.currentIndex >= this.displayImages.length - 1) {
      this.isResetting = true;
      this.currentIndex = 1;
      this.updateCarousel(false);
    }

    // Use a small timeout to let the browser apply the transition: none
    // before allowing the user to click next/prev again.
    setTimeout(() => {
      this.isTransitioning = false;
      this.isResetting = false;
    }, 50);
  }

  onDragStart(event: MouseEvent | TouchEvent) {
    if (this.originalImages.length <= 1 || this.isTransitioning || this.isResetting) return;
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
