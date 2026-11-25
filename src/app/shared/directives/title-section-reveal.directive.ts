import {
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

@Directive({
  selector: '[appTitleSectionReveal]',
  standalone: true,
})
export class TitleSectionRevealDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  private readonly tweens: gsap.core.Tween[] = [];
  private createdGlowEl: HTMLDivElement | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.tweens.forEach((tween) => tween.kill());
      this.tweens.length = 0;
      this.createdGlowEl?.remove();
      this.createdGlowEl = null;
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.el.nativeElement;
    if (getComputedStyle(host).position === 'static') {
      host.style.position = 'relative';
    }
    host.style.overflow = 'hidden';

    Array.from(host.children).forEach((child) => {
      if (child instanceof HTMLElement && !child.classList.contains('title-section-glow')) {
        if (getComputedStyle(child).position === 'static') {
          child.style.position = 'relative';
        }
        if (!child.style.zIndex) {
          child.style.zIndex = '1';
        }
      }
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.initGlow(host);
      this.animateTitle(host);
      this.animateComplementaryText(host);
    });
  }

  private initGlow(host: HTMLElement): void {
    let glow = host.querySelector<HTMLElement>('.title-section-glow');

    if (!glow) {
      const div = document.createElement('div');
      div.className = 'title-section-glow';
      div.setAttribute('aria-hidden', 'true');
      div.style.position = 'absolute';
      div.style.top = '-40%';
      div.style.right = '-10%';
      div.style.width = '520px';
      div.style.height = '520px';
      div.style.borderRadius = '50%';
      div.style.background =
        'radial-gradient(circle, rgba(208, 230, 193, 0.16), transparent 65%)';
      div.style.pointerEvents = 'none';
      div.style.zIndex = '0';
      host.prepend(div);
      this.createdGlowEl = div;
      glow = div;
    }

    const glowTween = gsap.to(glow, {
      x: -25,
      y: 20,
      scale: 1.08,
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    this.tweens.push(glowTween);
  }

  private animateTitle(host: HTMLElement): void {
    const h1 = host.querySelector('h1');
    if (!h1) {
      return;
    }

    let inner = h1.querySelector<HTMLElement>('.title-split-inner');
    if (!inner) {
      const mask = document.createElement('span');
      mask.className = 'title-split-mask';
      mask.style.overflow = 'hidden';
      mask.style.display = 'inline-block';
      mask.style.verticalAlign = 'bottom';

      inner = document.createElement('span');
      inner.className = 'title-split-inner';
      inner.style.display = 'inline-block';

      while (h1.firstChild) {
        inner.appendChild(h1.firstChild);
      }

      mask.appendChild(inner);
      h1.appendChild(mask);
    }

    const titleTween = gsap.fromTo(
      inner,
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 0.9,
        ease: 'power4.out',
        clearProps: 'transform',
      }
    );

    this.tweens.push(titleTween);
  }

  private animateComplementaryText(host: HTMLElement): void {
    const targets = Array.from(host.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        (child.tagName === 'SPAN' || child.tagName === 'P')
    );

    if (targets.length === 0) {
      return;
    }

    const textTween = gsap.fromTo(
      targets,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.1,
        delay: 0.12,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
      }
    );

    this.tweens.push(textTween);
  }
}
