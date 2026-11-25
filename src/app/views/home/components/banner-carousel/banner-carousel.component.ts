import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { BannersService } from '../../../../services/banners/banners.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-carousel.component.html',
  styleUrl: './banner-carousel.component.scss',
})
export class BannerCarouselComponent implements OnInit {
  private readonly bannersService = inject(BannersService);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('progressBarEl') progressBarEl?: ElementRef<HTMLElement>;

  originalImages: string[] = [];
  activeIndex = 0;
  isLoading = true;
  isPaused = false;

  private isDragging = false;
  private startX = 0;
  private currentX = 0;
  private readonly AUTOPLAY_SECONDS = 6;
  private progressTween: gsap.core.Tween | null = null;
  private reduceMotion = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
    }

    effect(() => {
      const banners = this.bannersService.activeBanners();
      const baseUrl = environment.imagesBaseUrl;

      this.isLoading = this.bannersService.isLoading();

      if (!this.isLoading) {
        if (banners.length > 0) {
          this.originalImages = banners.map((b) => {
            let url = b.imagePath;
            if (url && !url.startsWith('http') && !url.startsWith('assets/')) {
              if (baseUrl.includes('storage.googleapis.com')) {
                url = url.replace(/^\/?uploads\/?/, '/');
              }
              url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
            }
            return url;
          });
        } else {
          this.originalImages = [];
        }

        this.activeIndex = 0;
        if (isPlatformBrowser(this.platformId) && this.originalImages.length > 1) {
          setTimeout(() => this.restartProgress(), 0);
        } else {
          this.stopProgress();
        }
      }
    });

    this.destroyRef.onDestroy(() => {
      this.stopProgress();
    });
  }

  ngOnInit(): void {
    this.bannersService.getActive();
  }

  next(): void {
    if (this.originalImages.length <= 1) return;
    this.activeIndex = (this.activeIndex + 1) % this.originalImages.length;
    this.restartProgress();
  }

  prev(): void {
    if (this.originalImages.length <= 1) return;
    this.activeIndex =
      (this.activeIndex - 1 + this.originalImages.length) %
      this.originalImages.length;
    this.restartProgress();
  }

  private restartProgress(): void {
    this.stopProgress();
    if (
      !isPlatformBrowser(this.platformId) ||
      this.originalImages.length <= 1 ||
      this.reduceMotion
    ) {
      return;
    }

    const bar = this.progressBarEl?.nativeElement;
    if (!bar) return;

    this.ngZone.runOutsideAngular(() => {
      this.progressTween = gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: this.AUTOPLAY_SECONDS,
          ease: 'none',
          onComplete: () => {
            this.ngZone.run(() => this.next());
          },
        }
      );
      if (this.isPaused) {
        this.progressTween.pause();
      }
    });
  }

  private stopProgress(): void {
    this.progressTween?.kill();
    this.progressTween = null;
  }

  onDragStart(event: MouseEvent | TouchEvent): void {
    if (this.originalImages.length <= 1) return;
    this.isDragging = true;
    this.startX = this.getPositionX(event);
    this.currentX = this.startX;
    this.isPaused = true;
    this.progressTween?.pause();
  }

  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    this.currentX = this.getPositionX(event);
  }

  onDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    const diff = this.currentX - this.startX;

    this.isPaused = false;
    if (diff < -50) {
      this.next();
    } else if (diff > 50) {
      this.prev();
    } else {
      this.progressTween?.resume();
    }
  }

  private getPositionX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.pageX : event.touches[0].clientX;
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    if (this.isDragging) this.onDragEnd();
  }

  onMouseEnter(): void {
    this.isPaused = true;
    this.progressTween?.pause();
  }

  onMouseLeave(): void {
    this.isPaused = false;
    if (this.isDragging) {
      this.onDragEnd();
    } else {
      this.progressTween?.resume();
    }
  }

  onBannerError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('Banner-image-1.jpg')) {
      target.src = '/assets/images/banner/Banner-image-1.jpg';
    }
  }
}
