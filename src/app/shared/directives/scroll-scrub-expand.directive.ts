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
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Directive({
  selector: '[appScrollScrubExpand]',
  standalone: true,
})
export class ScrollScrubExpandDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly scrubMode = input<'expand' | 'zoomOut'>('expand');

  private tween: gsap.core.Tween | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.tween?.scrollTrigger?.kill();
      this.tween?.kill();
      this.tween = null;
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

    gsap.registerPlugin(ScrollTrigger);

    this.ngZone.runOutsideAngular(() => {
      const host = this.el.nativeElement;
      host.style.overflow = 'hidden';

      if (this.scrubMode() === 'zoomOut') {
        const target =
          host.tagName.toLowerCase() === 'img'
            ? host
            : (host.querySelector('img') ?? host);

        this.tween = gsap.fromTo(
          target,
          {
            scale: 1.1,
          },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: host,
              start: 'top 90%',
              end: 'center 50%',
              scrub: 0.7,
            },
          }
        );
        return;
      }

      this.tween = gsap.fromTo(
        host,
        {
          scale: 0.9,
          borderRadius: '44px',
        },
        {
          scale: 1,
          borderRadius: '20px',
          ease: 'none',
          scrollTrigger: {
            trigger: host,
            start: 'top 90%',
            end: 'center 55%',
            scrub: 0.7,
          },
        }
      );
    });
  }
}
