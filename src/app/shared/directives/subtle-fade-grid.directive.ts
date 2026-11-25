import {
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

@Directive({
  selector: '[appSubtleFadeGrid]',
  standalone: true,
})
export class SubtleFadeGridDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly fadeItemSelector = input<string>('app-item-card-gallery');

  private mutationObserver: MutationObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private readonly tracked = new WeakSet<HTMLElement>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.mutationObserver?.disconnect();
      this.mutationObserver = null;
      this.intersectionObserver?.disconnect();
      this.intersectionObserver = null;

      if (isPlatformBrowser(this.platformId)) {
        const items = this.el.nativeElement.querySelectorAll<HTMLElement>(
          this.fadeItemSelector()
        );
        if (items.length > 0) {
          gsap.killTweensOf(items);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const host = this.el.nativeElement;

      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const batch: HTMLElement[] = [];
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              batch.push(target);
              this.intersectionObserver?.unobserve(target);
            }
          }

          if (batch.length > 0) {
            batch.sort((a, b) => {
              const pos = a.compareDocumentPosition(b);
              return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
            });
            gsap.fromTo(
              batch,
              { opacity: 0, y: 26 },
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                ease: 'power2.out',
                stagger: 0.06,
                clearProps: 'transform,opacity',
              }
            );
          }
        },
        {
          rootMargin: '0px 0px -20px 0px',
          threshold: 0.02,
        }
      );

      this.observeNewItems(host);

      this.mutationObserver = new MutationObserver(() => {
        this.observeNewItems(host);
      });
      this.mutationObserver.observe(host, { childList: true });
    });
  }

  private observeNewItems(host: HTMLElement): void {
    const items = host.querySelectorAll<HTMLElement>(this.fadeItemSelector());
    items.forEach((item) => {
      if (this.tracked.has(item)) {
        return;
      }
      this.tracked.add(item);
      item.style.opacity = '0';
      this.intersectionObserver?.observe(item);
    });
  }
}
