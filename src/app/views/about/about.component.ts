import { Component, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BentoHoverDirective } from '../../shared/directives/bento-hover.directive';
import { SpotlightCardsDirective } from '../../shared/directives/spotlight-cards.directive';
import { ClipPathRevealDirective } from '../../shared/directives/clip-path-reveal.directive';
import { ScrollScrubExpandDirective } from '../../shared/directives/scroll-scrub-expand.directive';
import { CursorConstellationDirective } from '../../shared/directives/cursor-constellation.directive';
import { TitleSectionRevealDirective } from '../../shared/directives/title-section-reveal.directive';
import { SplitTextRevealDirective } from '../../shared/directives/split-text-reveal.directive';
import { calculateFitoherbYears } from '../../shared/utils/company-age.util';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, BentoHoverDirective, SpotlightCardsDirective, ClipPathRevealDirective, ScrollScrubExpandDirective, CursorConstellationDirective, TitleSectionRevealDirective, SplitTextRevealDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements AfterViewInit {
  @ViewChild('statsSection') statsSection!: ElementRef;
  @ViewChild('historySection') historySection!: ElementRef;
  @ViewChild('mvvSection') mvvSection!: ElementRef;
  @ViewChild('gallerySection') gallerySection!: ElementRef;
  @ViewChild('videoSection') videoSection!: ElementRef;
  @ViewChild('teamSection') teamSection!: ElementRef;

  readonly companyYears = calculateFitoherbYears();

  stats = {
    years: signal(0),
    products: signal(0),
    partners: signal(0),
    brands: signal(0)
  };

  private animatedStats = false;

  ngAfterViewInit(): void {
    this.initScrollObserver();
  }

  private initScrollObserver(): void {
    const options = {
      threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');

          if (entry.target === this.statsSection.nativeElement && !this.animatedStats) {
            this.animateNumbers();
          }

          observer.unobserve(entry.target);
        }
      });
    }, options);

    if (this.statsSection) observer.observe(this.statsSection.nativeElement);
    if (this.historySection) observer.observe(this.historySection.nativeElement);
    if (this.mvvSection) observer.observe(this.mvvSection.nativeElement);
    if (this.gallerySection) observer.observe(this.gallerySection.nativeElement);
    if (this.videoSection) observer.observe(this.videoSection.nativeElement);
    if (this.teamSection) observer.observe(this.teamSection.nativeElement);
  }

  private animateNumbers() {
    this.animatedStats = true;
    const duration = 1200;

    this.counter(this.companyYears, 'years', duration);
    this.counter(1800, 'products', duration);
    this.counter(2000, 'partners', duration);
    this.counter(40, 'brands', duration);
  }

  private counter(endValue: number, key: keyof typeof this.stats, duration: number) {
    let start = 0;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    const increment = endValue / totalFrames;
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      const currentValue = Math.round(increment * currentFrame);

      if (currentFrame <= totalFrames) {
        this.stats[key].set(currentValue);
      } else {
        this.stats[key].set(endValue);
        clearInterval(timer);
      }
    }, frameRate);
  }
}
