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

@Directive({
  selector: '[appContactGridField]',
  standalone: true,
})
export class ContactGridFieldDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;

  private width = 0;
  private height = 0;
  private mouseX = -9999;
  private mouseY = -9999;
  private isHovering = false;
  private reducedMotion = false;

  private readonly gap = 38;
  private readonly influenceRadius = 180;

  private readonly onPointerMove = (event: PointerEvent): void => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
    if (!this.isHovering) {
      this.isHovering = true;
      this.startLoop();
    }
  };

  private readonly onPointerLeave = (): void => {
    this.isHovering = false;
    this.mouseX = -9999;
    this.mouseY = -9999;
    this.stopLoop();
    this.draw();
  };

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.stopLoop();
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;

      const host = this.el.nativeElement;
      host.removeEventListener('pointermove', this.onPointerMove);
      host.removeEventListener('pointerleave', this.onPointerLeave);

      this.canvas?.remove();
      this.canvas = null;
      this.ctx = null;
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.el.nativeElement;
    this.reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    this.ngZone.runOutsideAngular(() => {
      if (getComputedStyle(host).position === 'static') {
        host.style.position = 'relative';
      }

      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '0';

      host.prepend(canvas);
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.updateCanvasSize();

      this.resizeObserver = new ResizeObserver(() => {
        this.updateCanvasSize();
      });
      this.resizeObserver.observe(host);

      if (!this.reducedMotion) {
        host.addEventListener('pointermove', this.onPointerMove, {
          passive: true,
        });
        host.addEventListener('pointerleave', this.onPointerLeave, {
          passive: true,
        });
      }
    });
  }

  private updateCanvasSize(): void {
    if (!this.canvas || !this.ctx) {
      return;
    }

    const rect = this.el.nativeElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.max(1, Math.floor(this.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(this.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.draw();
  }

  private startLoop(): void {
    if (this.rafId !== null || this.reducedMotion) {
      return;
    }

    const tick = (): void => {
      this.draw();
      if (this.isHovering) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx || this.width === 0 || this.height === 0) {
      return;
    }

    ctx.clearRect(0, 0, this.width, this.height);

    if (!this.reducedMotion && this.isHovering) {
      const halo = ctx.createRadialGradient(
        this.mouseX,
        this.mouseY,
        0,
        this.mouseX,
        this.mouseY,
        this.influenceRadius
      );
      halo.addColorStop(0, 'rgba(130, 176, 116, 0.11)');
      halo.addColorStop(1, 'rgba(130, 176, 116, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(this.mouseX, this.mouseY, this.influenceRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    const cols = Math.ceil(this.width / this.gap) + 1;
    const rows = Math.ceil(this.height / this.gap) + 1;
    const offsetX = (this.width - (cols - 1) * this.gap) / 2;
    const offsetY = (this.height - (rows - 1) * this.gap) / 2;

    ctx.lineCap = 'round';

    for (let row = 0; row < rows; row++) {
      const y = offsetY + row * this.gap;
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * this.gap;

        let inf = 0;
        let angle = 0;

        if (!this.reducedMotion && this.isHovering) {
          const dx = this.mouseX - x;
          const dy = this.mouseY - y;
          const dist = Math.hypot(dx, dy);
          if (dist < this.influenceRadius) {
            inf = 1 - dist / this.influenceRadius;
            angle = Math.atan2(dy, dx) * inf;
          }
        }

        const arm = 2.5 + inf * 2;
        const alpha = 0.1 + inf * 0.34;

        ctx.save();
        ctx.translate(x, y);
        if (angle !== 0) {
          ctx.rotate(angle);
        }
        ctx.strokeStyle = `rgba(76, 140, 62, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.2 + inf * 0.5;
        ctx.beginPath();
        ctx.moveTo(-arm, 0);
        ctx.lineTo(arm, 0);
        ctx.moveTo(0, -arm);
        ctx.lineTo(0, arm);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}
