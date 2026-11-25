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

type SplitToken =
  | { kind: 'word'; el: HTMLSpanElement; ancestors: HTMLElement[] }
  | { kind: 'space' }
  | { kind: 'br' };

@Directive({
  selector: '[appSplitTextReveal]',
  standalone: true,
})
export class SplitTextRevealDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly splitDuration = input<number>(0.95);
  readonly splitStagger = input<number>(0.1);
  readonly splitDelay = input<number>(0);

  private destroyed = false;
  private rafId: number | null = null;
  private observer: IntersectionObserver | null = null;
  private tween: gsap.core.Tween | null = null;
  private units: HTMLElement[] = [];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.observer?.disconnect();
      this.observer = null;
      if (this.units.length > 0) {
        gsap.killTweensOf(this.units);
      }
      this.tween?.kill();
      this.tween = null;
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      fontsReady.then(() => {
        if (this.destroyed) {
          return;
        }
        this.rafId = requestAnimationFrame(() => {
          this.rafId = null;
          if (this.destroyed) {
            return;
          }
          this.initSplitAndObserve();
        });
      });
    });
  }

  private initSplitAndObserve(): void {
    const host = this.el.nativeElement;
    this.units = this.splitIntoLines(host);

    if (this.units.length === 0) {
      return;
    }

    gsap.set(this.units, { yPercent: 115 });

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.observer?.disconnect();
            this.observer = null;
            this.tween = gsap.to(this.units, {
              yPercent: 0,
              duration: this.splitDuration(),
              ease: 'expo.out',
              stagger: this.splitStagger(),
              delay: this.splitDelay(),
              clearProps: 'transform',
            });
            break;
          }
        }
      },
      { threshold: 0.12 }
    );

    this.observer.observe(host);
  }

  private splitIntoLines(host: HTMLElement): HTMLElement[] {
    const tokens: SplitToken[] = [];

    const collectTokens = (node: Node, ancestors: HTMLElement[]): void => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent ?? '';
          const parts = text.split(/(\s+)/);
          const frag = document.createDocumentFragment();

          for (const part of parts) {
            if (!part) {
              continue;
            }
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(' '));
              tokens.push({ kind: 'space' });
            } else {
              const wordEl = document.createElement('span');
              wordEl.style.display = 'inline-block';
              wordEl.textContent = part;
              frag.appendChild(wordEl);
              tokens.push({
                kind: 'word',
                el: wordEl,
                ancestors: [...ancestors],
              });
            }
          }

          child.parentNode?.replaceChild(frag, child);
        } else if (child instanceof HTMLElement) {
          if (child.tagName === 'BR') {
            tokens.push({ kind: 'br' });
          } else {
            collectTokens(child, [...ancestors, child]);
          }
        }
      }
    };

    collectTokens(host, []);

    const lines: SplitToken[][] = [];
    let currentLine: SplitToken[] = [];
    let lastTop: number | null = null;

    for (const token of tokens) {
      if (token.kind === 'br') {
        while (
          currentLine.length > 0 &&
          currentLine[currentLine.length - 1].kind === 'space'
        ) {
          currentLine.pop();
        }
        if (currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
        }
        lastTop = null;
        continue;
      }

      if (token.kind === 'space') {
        if (
          currentLine.length > 0 &&
          currentLine[currentLine.length - 1].kind !== 'space'
        ) {
          currentLine.push(token);
        }
        continue;
      }

      const top = token.el.offsetTop;
      if (lastTop !== null && Math.abs(top - lastTop) > 4) {
        while (
          currentLine.length > 0 &&
          currentLine[currentLine.length - 1].kind === 'space'
        ) {
          currentLine.pop();
        }
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = [token];
        lastTop = top;
      } else {
        currentLine.push(token);
        lastTop = top;
      }
    }

    while (
      currentLine.length > 0 &&
      currentLine[currentLine.length - 1].kind === 'space'
    ) {
      currentLine.pop();
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    const fragment = document.createDocumentFragment();
    const units: HTMLElement[] = [];

    for (const line of lines) {
      if (!line.some((t) => t.kind === 'word')) {
        continue;
      }

      const mask = document.createElement('span');
      mask.className = 'split-line-mask';
      mask.style.display = 'block';
      mask.style.overflow = 'hidden';
      mask.style.paddingBottom = '0.12em';
      mask.style.marginBottom = '-0.12em';

      const unit = document.createElement('span');
      unit.className = 'split-line-unit';
      unit.style.display = 'block';
      unit.style.willChange = 'transform';

      let activeOrigAncestors: HTMLElement[] = [];
      let activeClonedAncestors: HTMLElement[] = [];

      const getTargetContainer = (origAncestors: HTMLElement[]): HTMLElement => {
        let common = 0;
        while (
          common < activeOrigAncestors.length &&
          common < origAncestors.length &&
          activeOrigAncestors[common] === origAncestors[common]
        ) {
          common++;
        }

        activeOrigAncestors = activeOrigAncestors.slice(0, common);
        activeClonedAncestors = activeClonedAncestors.slice(0, common);

        let parent: HTMLElement =
          activeClonedAncestors.length > 0
            ? activeClonedAncestors[activeClonedAncestors.length - 1]
            : unit;

        for (let i = common; i < origAncestors.length; i++) {
          const clone = origAncestors[i].cloneNode(false) as HTMLElement;
          clone.removeAttribute('id');
          parent.appendChild(clone);
          activeOrigAncestors.push(origAncestors[i]);
          activeClonedAncestors.push(clone);
          parent = clone;
        }

        return parent;
      };

      for (let i = 0; i < line.length; i++) {
        const token = line[i];
        if (token.kind === 'space') {
          const nextToken = line[i + 1];
          if (nextToken && nextToken.kind === 'word') {
            let common = 0;
            while (
              common < activeOrigAncestors.length &&
              common < nextToken.ancestors.length &&
              activeOrigAncestors[common] === nextToken.ancestors[common]
            ) {
              common++;
            }
            const spaceTarget =
              common > 0 ? activeClonedAncestors[common - 1] : unit;
            spaceTarget.appendChild(document.createTextNode(' '));
          }
          continue;
        }

        if (token.kind === 'word') {
          const container = getTargetContainer(token.ancestors);
          container.appendChild(
            document.createTextNode(token.el.textContent ?? '')
          );
        }
      }

      mask.appendChild(unit);
      fragment.appendChild(mask);
      units.push(unit);
    }

    host.replaceChildren(fragment);
    return units;
  }
}
