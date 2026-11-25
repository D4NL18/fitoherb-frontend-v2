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
  selector: '[appMagneticButton]',
  standalone: true,
})
export class MagneticButtonDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly magneticStrength = input<number>(0.35);

  private timeline: gsap.core.Timeline | null = null;
  private gsapTargets: HTMLElement[] = [];
  private cleanupFns: Array<() => void> = [];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cleanupFns.forEach((fn) => fn());
      this.cleanupFns = [];

      this.timeline?.kill();
      this.timeline = null;

      this.gsapTargets.forEach((target) => gsap.killTweensOf(target));
      this.gsapTargets = [];
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.el.nativeElement;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      host.classList.add('nomag');
      return;
    }

    const fill = host.querySelector<HTMLElement>('.magnetic-fill');
    const label = host.querySelector<HTMLElement>('.magnetic-label');
    const arrA = host.querySelector<HTMLElement>('.arr.a');
    const arrB = host.querySelector<HTMLElement>('.arr.b');

    if (!fill || !label || !arrA || !arrB) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      fill.style.transform = 'none';
      arrB.style.transform = 'none';

      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.5, ease: 'power3.inOut' },
      });

      tl.to(
        fill,
        {
          scale: 1,
          top: '50%',
          yPercent: -50,
          xPercent: -50,
          x: 0,
          y: 0,
          duration: 0.55,
        },
        0
      )
        .to(arrA, { xPercent: 110, yPercent: -110 }, 0)
        .fromTo(
          arrB,
          { xPercent: -110, yPercent: 110 },
          { xPercent: 0, yPercent: 0 },
          0
        );

      gsap.set(fill, {
        xPercent: -50,
        yPercent: 0,
        scale: 0,
        transformOrigin: '50% 50%',
      });

      // Clear CSS transforms conflicting with GSAP
      fill.style.transform = '';
      gsap.set(arrB, { xPercent: -110, yPercent: 110 });

      this.timeline = tl;
      this.gsapTargets = [host, fill, label, arrA, arrB];

      const on = (): void => {
        host.classList.add('on');
        tl.timeScale(1).play();
      };

      const off = (): void => {
        host.classList.remove('on');
        tl.timeScale(1.4).reverse();
      };

      host.addEventListener('focus', on);
      host.addEventListener('blur', off);
      this.cleanupFns.push(() => {
        host.removeEventListener('focus', on);
        host.removeEventListener('blur', off);
      });

      if (!window.matchMedia('(pointer: fine)').matches) {
        return;
      }

      const bx = gsap.quickTo(host, 'x', {
        duration: 1,
        ease: 'elastic.out(1, 0.4)',
      });
      const by = gsap.quickTo(host, 'y', {
        duration: 1,
        ease: 'elastic.out(1, 0.4)',
      });
      const lx = gsap.quickTo(label, 'x', {
        duration: 1,
        ease: 'elastic.out(1, 0.4)',
      });
      const ly = gsap.quickTo(label, 'y', {
        duration: 1,
        ease: 'elastic.out(1, 0.4)',
      });

      const onPointerMove = (e: PointerEvent): void => {
        const s = this.magneticStrength();
        const r = host.getBoundingClientRect();
        const ox = e.clientX - (r.left + r.width / 2);
        const oy = e.clientY - (r.top + r.height / 2);
        bx(ox * s);
        by(oy * s);
        lx(ox * s * 0.5);
        ly(oy * s * 0.5);
      };

      const onPointerLeave = (): void => {
        bx(0);
        by(0);
        lx(0);
        ly(0);
        off();
      };

      host.addEventListener('pointerenter', on);
      host.addEventListener('pointermove', onPointerMove);
      host.addEventListener('pointerleave', onPointerLeave);
      this.cleanupFns.push(() => {
        host.removeEventListener('pointerenter', on);
        host.removeEventListener('pointermove', onPointerMove);
        host.removeEventListener('pointerleave', onPointerLeave);
      });
    });
  }
}
