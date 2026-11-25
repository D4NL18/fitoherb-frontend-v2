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

@Directive({
  selector: '[appSpotlightCards]',
  standalone: true,
})
export class SpotlightCardsDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly spotlightCardSelector = input<string>('.spotlight-card');

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.el.nativeElement;
    let px = 0;
    let py = 0;
    let pending = false;
    let rafId: number | null = null;

    const update = () => {
      pending = false;
      rafId = null;
      const cards = host.querySelectorAll<HTMLElement>(this.spotlightCardSelector());
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${px - rect.left}px`);
        card.style.setProperty('--my', `${py - rect.top}px`);
      });
    };

    const scheduleUpdate = () => {
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(update);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      scheduleUpdate();
    };

    const onScroll = () => {
      scheduleUpdate();
    };

    const onResize = () => {
      scheduleUpdate();
    };

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }
}
