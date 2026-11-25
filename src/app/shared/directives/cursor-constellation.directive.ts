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

interface ConstellationNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

@Directive({
  selector: '[appCursorConstellation]',
  standalone: true,
})
export class CursorConstellationDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private nodes: ConstellationNode[] = [];
  private mouseX = -999;
  private mouseY = -999;
  private smoothX = -999;
  private smoothY = -999;
  private reducedMotion = false;

  private readonly onPointerMove = (e: PointerEvent) => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    if (this.smoothX < -500) {
      this.smoothX = this.mouseX;
      this.smoothY = this.mouseY;
    }
  };

  private readonly onPointerLeave = () => {
    this.mouseX = -999;
    this.mouseY = -999;
  };

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
      const host = this.el.nativeElement as HTMLElement;
      host.removeEventListener('pointermove', this.onPointerMove);
      host.removeEventListener('pointerleave', this.onPointerLeave);
      this.canvas?.remove();
      this.canvas = null;
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    this.ngZone.runOutsideAngular(() => {
      const host = this.el.nativeElement as HTMLElement;
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

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const initSize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        canvas.width = w;
        canvas.height = h;
        const targetCount = Math.min(48, Math.max(22, Math.floor((w * h) / 22000)));
        if (this.nodes.length !== targetCount) {
          this.nodes = Array.from({ length: targetCount }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: 1.4 + Math.random() * 1.6,
          }));
        }
      };

      initSize();
      this.resizeObserver = new ResizeObserver(() => {
        initSize();
        if (this.reducedMotion) drawFrame();
      });
      this.resizeObserver.observe(host);

      if (!this.reducedMotion) {
        host.addEventListener('pointermove', this.onPointerMove, { passive: true });
        host.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
      }

      const drawFrame = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (this.mouseX > -500) {
          this.smoothX += (this.mouseX - this.smoothX) * 0.12;
          this.smoothY += (this.mouseY - this.smoothY) * 0.12;
          const grad = ctx.createRadialGradient(
            this.smoothX,
            this.smoothY,
            0,
            this.smoothX,
            this.smoothY,
            260
          );
          grad.addColorStop(0, 'rgba(130, 176, 116, 0.22)');
          grad.addColorStop(0.55, 'rgba(76, 140, 62, 0.08)');
          grad.addColorStop(1, 'rgba(76, 140, 62, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        } else {
          this.smoothX = -999;
          this.smoothY = -999;
        }

        for (let i = 0; i < this.nodes.length; i++) {
          const n = this.nodes[i];
          if (!this.reducedMotion) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > w) n.vx *= -1;
            if (n.y < 0 || n.y > h) n.vy *= -1;
          }

          const dMouse =
            this.smoothX > -500 ? Math.hypot(n.x - this.smoothX, n.y - this.smoothY) : 9999;
          const boost = Math.max(0, 1 - dMouse / 210);

          if (dMouse < 210 && this.smoothX > -500) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(this.smoothX, this.smoothY);
            ctx.strokeStyle = `rgba(180, 224, 165, ${(boost * 0.35).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          for (let j = i + 1; j < this.nodes.length; j++) {
            const m = this.nodes[j];
            const dist = Math.hypot(n.x - m.x, n.y - m.y);
            if (dist < 130) {
              const alpha = (1 - dist / 130) * (0.1 + boost * 0.2);
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(m.x, m.y);
              ctx.strokeStyle = `rgba(165, 214, 148, ${alpha.toFixed(3)})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + boost * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(208, 230, 193, ${(0.28 + boost * 0.6).toFixed(3)})`;
          ctx.fill();
        }

        if (!this.reducedMotion) {
          this.rafId = requestAnimationFrame(drawFrame);
        }
      };

      drawFrame();
    });
  }
}
