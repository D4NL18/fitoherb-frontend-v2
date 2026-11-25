import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  NgZone,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import gsap from 'gsap';
import { SupplierRes } from '../../../../types/suppliers/SupplierRes.interface';

@Component({
  selector: 'app-suppliers-3d-carousel',
  standalone: true,
  imports: [],
  templateUrl: './suppliers-3d-carousel.component.html',
  styleUrl: './suppliers-3d-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Suppliers3dCarouselComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  suppliers = input<SupplierRes[]>([]);

  @ViewChild('stageRef') stageRef?: ElementRef<HTMLElement>;
  @ViewChild('ringRef') ringRef?: ElementRef<HTMLElement>;

  readonly fallbackImage = '/assets/images/fitoherb-leaf-icon.png';

  private readonly RADIUS_FACTOR = 1.15;
  private readonly AUTO_SPEED = 4.5; // deg/s (rotação lenta e contínua)
  private readonly IDLE_RESUME_SECONDS = 2.5; // pausa após arrastar antes de voltar a rodar

  private st = { rot: 0 };
  private radius = 420;
  private dragging = false;
  private didDrag = false;
  private pointerCaptured = false;
  private lastX = 0;
  private totalDx = 0;
  private vel = 0;
  private idle = this.IDLE_RESUME_SECONDS;
  private lastTime = 0;
  private rafId: number | null = null;
  private layoutRafId: number | null = null;
  private viewReady = false;
  private reduceMotion = false;
  private boundStage: HTMLElement | null = null;
  private cleanupStageListeners: (() => void) | null = null;

  constructor() {
    effect(() => {
      // Track suppliers signal so layout recomputes whenever data arrives
      const list = this.suppliers();
      if (!this.viewReady || !isPlatformBrowser(this.platformId)) return;
      if (list.length === 0) return;

      this.ngZone.runOutsideAngular(() => {
        if (this.layoutRafId !== null) {
          cancelAnimationFrame(this.layoutRafId);
        }
        this.layoutRafId = requestAnimationFrame(() => {
          this.layoutRafId = null;
          this.layout();
        });
      });
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.viewReady = true;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ngZone.runOutsideAngular(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target?.isContentEditable
        ) {
          return;
        }
        if (e.key === 'ArrowRight') {
          this.go(1);
        } else if (e.key === 'ArrowLeft') {
          this.go(-1);
        }
      };

      const onResize = () => this.layout();

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('resize', onResize);

      this.ensureStageListeners();
      this.layout();

      if (!this.reduceMotion) {
        this.lastTime = performance.now();
        const tick = (now: number) => {
          const dt = Math.min((now - this.lastTime) / 1000, 0.1);
          this.lastTime = now;
          this.idle += dt;
          if (!this.dragging && !gsap.isTweening(this.st) && this.idle >= this.IDLE_RESUME_SECONDS) {
            this.st.rot += this.AUTO_SPEED * dt;
            this.apply();
          }
          this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
      }

      this.destroyRef.onDestroy(() => {
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        if (this.layoutRafId !== null) {
          cancelAnimationFrame(this.layoutRafId);
          this.layoutRafId = null;
        }
        gsap.killTweensOf(this.st);
        this.cleanupStageListeners?.();
        this.cleanupStageListeners = null;
        this.boundStage = null;
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('resize', onResize);
      });
    });
  }

  private ensureStageListeners(): void {
    const stage = this.stageRef?.nativeElement;
    if (!stage || this.boundStage === stage) return;

    this.cleanupStageListeners?.();
    this.boundStage = stage;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;

      this.dragging = true;
      this.didDrag = false;
      this.pointerCaptured = false;
      this.lastX = e.clientX;
      this.totalDx = 0;
      this.vel = 0;
      this.idle = 0;
      gsap.killTweensOf(this.st);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      this.lastX = e.clientX;
      this.totalDx += Math.abs(dx);

      if (!this.didDrag && this.totalDx >= 6) {
        this.didDrag = true;
        stage.classList.add('drag');
        try {
          stage.setPointerCapture(e.pointerId);
          this.pointerCaptured = true;
        } catch {
          // Ignore if pointer capture is unavailable
        }
      }

      if (this.didDrag) {
        this.vel = dx * 0.35;
        this.st.rot += dx * 0.35;
        this.idle = 0;
        this.apply();
      }
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (!this.dragging) return;
      this.dragging = false;
      stage.classList.remove('drag');

      if (this.pointerCaptured) {
        this.pointerCaptured = false;
        try {
          if (stage.hasPointerCapture(e.pointerId)) {
            stage.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore release errors
        }
      }

      if (!this.didDrag) {
        this.idle = 0;
        return;
      }

      setTimeout(() => {
        this.didDrag = false;
      }, 0);

      if (this.reduceMotion) {
        this.snap();
        return;
      }

      const cards = this.getCards();
      if (cards.length > 0) {
        const step = 360 / cards.length;
        const inertia = this.vel * 14;
        gsap.to(this.st, {
          rot: Math.round((this.st.rot + inertia) / step) * step,
          duration: 1.2,
          ease: 'power3.out',
          onUpdate: () => this.apply(),
          onComplete: () => {
            this.apply();
            this.idle = 0;
          },
        });
      }
      this.idle = 0;
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerEnd);
    stage.addEventListener('pointercancel', onPointerEnd);

    this.cleanupStageListeners = () => {
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerEnd);
      stage.removeEventListener('pointercancel', onPointerEnd);
    };
  }

  step(dir: -1 | 1): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.ngZone.runOutsideAngular(() => this.go(dir));
  }

  onCardClick(slug: string): void {
    if (this.didDrag) return;
    this.navigateToSupplier(slug);
  }

  onCardKeydown(event: KeyboardEvent, slug: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.navigateToSupplier(slug);
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.dataset['fallbackApplied'] === 'true') return;
    img.dataset['fallbackApplied'] = 'true';
    img.src = this.fallbackImage;
  }

  private navigateToSupplier(slug: string): void {
    this.ngZone.run(() => {
      this.router.navigate(['/produtos'], { queryParams: { supplier: slug } });
    });
  }

  private getCards(): HTMLElement[] {
    const ring = this.ringRef?.nativeElement;
    if (!ring) return [];
    return Array.from(ring.children) as HTMLElement[];
  }

  private layout(): void {
    this.ensureStageListeners();
    const cards = this.getCards();
    const n = cards.length;
    if (n === 0) return;

    const w = cards[0].offsetWidth || 220;
    const step = 360 / n;
    const denom = Math.tan(Math.PI / Math.max(n, 2));
    this.radius = Math.round(((w / 2) / denom) * this.RADIUS_FACTOR);

    cards.forEach((c, i) => {
      c.style.transform = `rotateY(${i * step}deg) translateZ(${this.radius}px)`;
    });
    this.apply();
  }

  private apply(): void {
    const ring = this.ringRef?.nativeElement;
    if (!ring) return;
    const cards = this.getCards();
    const n = cards.length;
    if (n === 0) return;

    const step = 360 / n;
    ring.style.transform = `translateZ(${-this.radius}px) rotateY(${this.st.rot}deg)`;
    cards.forEach((c, i) => {
      const a = (((i * step + this.st.rot) % 360) + 540) % 360 - 180;
      const dim = Math.min(0.65, (Math.abs(a) / 180) * 0.85).toFixed(3);
      c.style.setProperty('--dim', dim);
    });
  }

  private snap(): void {
    const cards = this.getCards();
    if (cards.length === 0) return;
    const step = 360 / cards.length;
    const target = Math.round(this.st.rot / step) * step;
    gsap.to(this.st, {
      rot: target,
      duration: this.reduceMotion ? 0 : 0.8,
      ease: 'power3.out',
      onUpdate: () => this.apply(),
      onComplete: () => this.apply(),
    });
  }

  private go(dir: number): void {
    const cards = this.getCards();
    if (cards.length === 0) return;
    const step = 360 / cards.length;
    gsap.killTweensOf(this.st);
    this.st.rot = Math.round(this.st.rot / step) * step;
    gsap.to(this.st, {
      rot: this.st.rot - dir * step,
      duration: this.reduceMotion ? 0 : 0.8,
      ease: 'power3.inOut',
      onUpdate: () => this.apply(),
      onComplete: () => this.apply(),
    });
    this.idle = 0;
  }
}
