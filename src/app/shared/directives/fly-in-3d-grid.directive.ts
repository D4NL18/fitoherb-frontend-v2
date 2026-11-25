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
  selector: '[appFlyIn3dGrid]',
  standalone: true,
})
export class FlyIn3dGridDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly flyCardSelector = input<string>('.supplier-card');

  private mutationObserver: MutationObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private processedCards = new WeakSet<HTMLElement>();
  private animatedCards = new WeakSet<HTMLElement>();
  private pendingBatch: HTMLElement[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private reducedMotion = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.mutationObserver?.disconnect();
      this.mutationObserver = null;
      this.intersectionObserver?.disconnect();
      this.intersectionObserver = null;

      if (this.batchTimer !== null) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }

      const host = this.el.nativeElement as HTMLElement;
      const cards = host.querySelectorAll<HTMLElement>(this.flyCardSelector());
      if (cards.length > 0) {
        gsap.killTweensOf(cards);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    this.ngZone.runOutsideAngular(() => {
      const host = this.el.nativeElement;
      host.style.perspective = '1100px';
      host.style.perspectiveOrigin = '50% 45%';

      if (!this.reducedMotion && 'IntersectionObserver' in window) {
        this.intersectionObserver = new IntersectionObserver(
          (entries) => {
            let added = false;
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const card = entry.target as HTMLElement;
              if (this.animatedCards.has(card)) continue;
              this.animatedCards.add(card);
              this.intersectionObserver?.unobserve(card);
              this.pendingBatch.push(card);
              added = true;
            }

            if (added && this.batchTimer === null) {
              this.batchTimer = setTimeout(() => {
                this.batchTimer = null;
                this.flushBatch();
              }, 30);
            }
          },
          {
            rootMargin: '0px 0px -20px 0px',
            threshold: 0.05,
          }
        );
      }

      this.registerCards();

      this.mutationObserver = new MutationObserver(() => {
        this.registerCards();
      });
      this.mutationObserver.observe(host, {
        childList: true,
        subtree: true,
      });
    });
  }

  private registerCards(): void {
    const host = this.el.nativeElement as HTMLElement;
    const allCards = Array.from(
      host.querySelectorAll<HTMLElement>(this.flyCardSelector())
    );
    const newCards = allCards.filter((card) => !this.processedCards.has(card));

    if (newCards.length === 0) {
      return;
    }

    newCards.forEach((card) => this.processedCards.add(card));

    if (this.reducedMotion || !this.intersectionObserver) {
      gsap.set(newCards, {
        opacity: 1,
        clearProps: 'filter,transform',
      });
      return;
    }

    // Keep exact layout geometry before reveal so IntersectionObserver triggers accurately
    gsap.set(newCards, {
      opacity: 0,
      transition: 'none',
    });

    newCards.forEach((card) => this.intersectionObserver?.observe(card));
  }

  private flushBatch(): void {
    if (this.pendingBatch.length === 0) return;

    const batch = this.pendingBatch.splice(0, this.pendingBatch.length);
    // Preserve DOM reading order (left-to-right, top-to-bottom)
    batch.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    gsap.fromTo(
      batch,
      {
        z: 360,
        scale: 1.28,
        y: 28,
        rotationX: -16,
        opacity: 0,
        filter: 'blur(8px)',
      },
      {
        z: 0,
        scale: 1,
        y: 0,
        rotationX: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.72,
        ease: 'power3.out',
        stagger: 0.08,
        clearProps: 'filter,transform,transition',
      }
    );
  }
}
