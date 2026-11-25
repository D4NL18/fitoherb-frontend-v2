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
  selector: '[appBentoHover]',
  standalone: true,
})
export class BentoHoverDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly bentoTileSelector = input<string>('.bento-item');
  readonly bentoTilt = input<number>(8);

  private readonly initializedTiles = new Set<HTMLElement>();
  private readonly animatedTiles = new WeakSet<HTMLElement>();
  private readonly initializedCounters = new Set<HTMLElement>();
  private readonly scrollTriggers: ScrollTrigger[] = [];
  private readonly cleanupFns: Array<() => void> = [];
  private mutationObserver: MutationObserver | null = null;
  private tileIntersectionObserver: IntersectionObserver | null = null;
  private pendingTileBatch: HTMLElement[] = [];
  private tileBatchTimer: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.el.nativeElement;
    host.classList.add('bento-grid-3d');

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      this.applyReducedMotionValues(host);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    this.ngZone.runOutsideAngular(() => {
      if ('IntersectionObserver' in window) {
        this.tileIntersectionObserver = new IntersectionObserver(
          (entries) => {
            let added = false;
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const tile = entry.target as HTMLElement;
              if (this.animatedTiles.has(tile)) continue;
              this.animatedTiles.add(tile);
              this.tileIntersectionObserver?.unobserve(tile);
              this.pendingTileBatch.push(tile);
              added = true;
            }
            if (added && this.tileBatchTimer === null) {
              this.tileBatchTimer = setTimeout(() => {
                this.tileBatchTimer = null;
                this.flushTileBatch();
              }, 30);
            }
          },
          { rootMargin: '0px 0px -20px 0px', threshold: 0.05 }
        );
      }

      this.setupTiles(host);
      this.setupCounters(host);

      this.mutationObserver = new MutationObserver(() => {
        const added = this.setupTiles(host);
        this.setupCounters(host);
        if (added) {
          ScrollTrigger.refresh();
        }
      });

      this.mutationObserver.observe(host, {
        childList: true,
        subtree: true,
      });
    });

    this.destroyRef.onDestroy(() => {
      this.mutationObserver?.disconnect();
      this.mutationObserver = null;
      this.tileIntersectionObserver?.disconnect();
      this.tileIntersectionObserver = null;
      if (this.tileBatchTimer !== null) {
        clearTimeout(this.tileBatchTimer);
        this.tileBatchTimer = null;
      }

      this.cleanupFns.forEach((fn) => fn());
      this.cleanupFns.length = 0;

      this.scrollTriggers.forEach((st) => st.kill());
      this.scrollTriggers.length = 0;

      if (this.initializedTiles.size > 0) {
        gsap.killTweensOf(Array.from(this.initializedTiles));
        this.initializedTiles.clear();
      }
      this.initializedCounters.clear();
    });
  }

  private applyReducedMotionValues(host: HTMLElement): void {
    const counters = host.querySelectorAll<HTMLElement>('[data-count]');
    counters.forEach((counterEl) => {
      const end = parseFloat(counterEl.dataset['count'] ?? '0');
      const dec = parseInt(counterEl.dataset['decimals'] ?? '0', 10);
      const suf = counterEl.dataset['suffix'] ?? '';
      counterEl.textContent =
        (dec ? end.toFixed(dec) : Math.round(end).toLocaleString('en-US')) +
        suf;
    });
  }

  private setupTiles(host: HTMLElement): boolean {
    const allTiles = Array.from(
      host.querySelectorAll<HTMLElement>(this.bentoTileSelector())
    );
    const newTiles = allTiles.filter((tile) => !this.initializedTiles.has(tile));

    if (newTiles.length === 0) {
      return false;
    }

    newTiles.forEach((tile) => {
      this.initializedTiles.add(tile);
      tile.classList.add('bento-tile-3d');
    });

    if (this.tileIntersectionObserver) {
      gsap.set(newTiles, { opacity: 0 });
      newTiles.forEach((tile) => this.tileIntersectionObserver?.observe(tile));
    }

    const canHoverFine = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;
    const tilt = this.bentoTilt();

    if (canHoverFine && tilt > 0) {
      newTiles.forEach((tile) => this.bindHoverTilt(tile, tilt));
    }

    return true;
  }

  private flushTileBatch(): void {
    if (this.pendingTileBatch.length === 0) return;
    const batch = this.pendingTileBatch.splice(0, this.pendingTileBatch.length);
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
        stagger: 0.09,
        overwrite: 'auto',
        clearProps: 'filter,transform',
      }
    );
  }

  private setupCounters(host: HTMLElement): void {
    const counters = Array.from(
      host.querySelectorAll<HTMLElement>('[data-count]')
    ).filter((el) => !this.initializedCounters.has(el));

    counters.forEach((counterEl) => {
      this.initializedCounters.add(counterEl);

      const end = parseFloat(counterEl.dataset['count'] ?? '0');
      const dec = parseInt(counterEl.dataset['decimals'] ?? '0', 10);
      const suf = counterEl.dataset['suffix'] ?? '';
      const state = { v: 0 };

      counterEl.textContent = (0).toFixed(dec) + suf;

      const tween = gsap.to(state, {
        v: end,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: counterEl,
          start: 'top 90%',
          once: true,
        },
        onUpdate: () => {
          counterEl.textContent =
            (dec
              ? state.v.toFixed(dec)
              : Math.round(state.v).toLocaleString('en-US')) + suf;
        },
      });

      if (tween.scrollTrigger) {
        this.scrollTriggers.push(tween.scrollTrigger);
      }
    });
  }

  private bindHoverTilt(tile: HTMLElement, tilt: number): void {
    const rx = gsap.quickTo(tile, 'rotationX', {
      duration: 0.5,
      ease: 'power3.out',
    });
    const ry = gsap.quickTo(tile, 'rotationY', {
      duration: 0.5,
      ease: 'power3.out',
    });
    const sc = gsap.quickTo(tile, 'scale', {
      duration: 0.5,
      ease: 'power3.out',
    });

    const onPointerMove = (e: PointerEvent) => {
      const r = tile.getBoundingClientRect();
      if (!r.width || !r.height) {
        return;
      }
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      tile.style.setProperty('--mx', `${x * 100}%`);
      tile.style.setProperty('--my', `${y * 100}%`);
      ry((x - 0.5) * tilt * 2);
      rx(-(y - 0.5) * tilt * 2);
      sc(1.02);
    };

    const onPointerLeave = () => {
      rx(0);
      ry(0);
      sc(1);
    };

    tile.addEventListener('pointermove', onPointerMove);
    tile.addEventListener('pointerleave', onPointerLeave);

    this.cleanupFns.push(() => {
      tile.removeEventListener('pointermove', onPointerMove);
      tile.removeEventListener('pointerleave', onPointerLeave);
    });
  }
}
