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

export type ClipRevealDirection = 'left' | 'right' | 'up' | 'circle';

const HIDDEN_CLIPS: Record<ClipRevealDirection, string> = {
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
  up: 'inset(100% 0 0 0)',
  circle: 'circle(0% at 50% 50%)',
};

const SHOWN_CLIPS: Record<ClipRevealDirection, string> = {
  left: 'inset(0 0% 0 0)',
  right: 'inset(0 0 0 0%)',
  up: 'inset(0% 0 0 0)',
  circle: 'circle(75% at 50% 50%)',
};

@Directive({
  selector: '[appClipPathReveal]',
  standalone: true,
})
export class ClipPathRevealDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly revealDirection = input<ClipRevealDirection>('left');
  readonly revealCurtain = input<boolean>(false);
  readonly curtainColor = input<string>('#1f3b21');

  private timeline: gsap.core.Timeline | null = null;
  private curtainEl: HTMLDivElement | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.timeline?.scrollTrigger?.kill();
      this.timeline?.kill();
      this.timeline = null;
      this.curtainEl?.remove();
      this.curtainEl = null;
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.el.nativeElement;
    const img = host.querySelector('img');
    if (!img) {
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
      if (getComputedStyle(host).position === 'static') {
        host.style.position = 'relative';
      }
      host.style.overflow = 'hidden';

      const dir = this.revealDirection();
      const useCurtain = this.revealCurtain();

      // Prevent CSS transition on img from fighting GSAP scale animation during reveal
      img.style.transition = 'none';
      gsap.set(img, {
        clipPath: HIDDEN_CLIPS[dir],
        scale: 1.4,
      });

      if (useCurtain) {
        const curtain = document.createElement('div');
        curtain.className = 'clip-reveal-curtain';
        curtain.setAttribute('aria-hidden', 'true');
        curtain.style.position = 'absolute';
        curtain.style.inset = '0';
        curtain.style.zIndex = '2';
        curtain.style.pointerEvents = 'none';
        curtain.style.background = this.curtainColor();
        curtain.style.transform = 'scaleX(0)';
        curtain.style.transformOrigin = 'left';
        host.appendChild(curtain);
        this.curtainEl = curtain;
      }

      this.timeline = gsap.timeline({
        scrollTrigger: {
          trigger: host,
          start: 'top 82%',
          once: true,
        },
        onComplete: () => {
          this.curtainEl?.remove();
          this.curtainEl = null;
          gsap.set(img, { clearProps: 'clipPath,transform,transition' });
        },
      });

      if (this.curtainEl) {
        this.timeline
          .fromTo(
            this.curtainEl,
            { scaleX: 0, transformOrigin: 'left' },
            { scaleX: 1, duration: 0.55, ease: 'power3.inOut' }
          )
          .set(img, { clipPath: SHOWN_CLIPS[dir] })
          .set(this.curtainEl, { transformOrigin: 'right' })
          .to(this.curtainEl, {
            scaleX: 0,
            duration: 0.75,
            ease: 'power3.inOut',
          })
          .to(
            img,
            {
              scale: 1,
              duration: 1.3,
              ease: 'power3.out',
              clearProps: 'transform',
            },
            '<'
          );
      } else {
        this.timeline
          .to(img, {
            clipPath: SHOWN_CLIPS[dir],
            duration: 1.4,
            ease: 'power3.inOut',
          })
          .to(
            img,
            {
              scale: 1,
              duration: 1.6,
              ease: 'power3.out',
              clearProps: 'transform',
            },
            '<'
          );
      }
    });
  }
}
