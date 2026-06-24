import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

export interface CarouselSlide {
  /** Slide headline — main copy */
  headline: string;
  /** Italic accent line displayed above the headline */
  accent: string;
  /** Body copy beneath the headline */
  subtitle: string;
  /**
   * Sanitized CSS background-image value (SafeStyle).
   * Angular's DomSanitizer would otherwise strip url(...) values
   * bound via [style.background] in template expressions.
   */
  backgroundImage: SafeStyle;
  /** Overlay gradient that ensures text legibility over the background */
  overlay: SafeStyle;
  /** Label for the primary CTA button */
  cta: string;
  /** Router path for the CTA button */
  ctaLink: string;
}

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css',
})
export class HeroBanner implements OnInit, OnDestroy {

  currentSlide = 0;
  isAnimating  = false;
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;
  private readonly AUTO_PLAY_INTERVAL = 5000; // ms

  slides: CarouselSlide[];

  constructor(private sanitizer: DomSanitizer) {
    // DomSanitizer.bypassSecurityTrustStyle() is required so Angular does NOT
    // silently strip url('/...') values from inline [style] bindings.
    this.slides = [
      {
        accent:          'Nova Kolekcija 2025',
        headline:        'Otkrijte Svoju\nPrirodnu Lepotu',
        subtitle:        'Premijum kozmetika sazdana od pažljivo biranih sastojaka koji neguju i ističu vaš unutrašnji sjaj.',
        backgroundImage: this.sanitizer.bypassSecurityTrustStyle("url('/hero-slide-1.jpg')"),
        overlay:         this.sanitizer.bypassSecurityTrustStyle(
                           'linear-gradient(105deg, rgba(253,246,240,0.85) 0%, rgba(253,246,240,0.50) 45%, rgba(253,246,240,0.05) 100%)'
                         ),
        cta:             'Istraži Proizvode',
        ctaLink:         '/products',
      },
      {
        accent:          'Ekskluzivno u GlamShop-u',
        headline:        'Glamur u Svakom\nDetalju',
        subtitle:        'Odabrani bestselleri iz sveta šminke i nege koji transformišu vašu svakodnevnu rutinu u ritual lepote.',
        backgroundImage: this.sanitizer.bypassSecurityTrustStyle("url('/hero-slide-2.jpg')"),
        overlay:         this.sanitizer.bypassSecurityTrustStyle(
                           'linear-gradient(105deg, rgba(253,246,240,0.82) 0%, rgba(250,240,234,0.45) 50%, rgba(250,240,234,0.02) 100%)'
                         ),
        cta:             'Pogledaj Šminku',
        ctaLink:         '/products',
      },
      {
        accent:          'Bestselleri',
        headline:        'Miris Koji\nOstaje u Sećanju',
        subtitle:        'Ekskluzivna kolekcija parfema — od cvjetnih nota do drvenastih dubina. Pronadjite svoju savršenu auru.',
        backgroundImage: this.sanitizer.bypassSecurityTrustStyle("url('/hero-slide-3.jpg')"),
        overlay:         this.sanitizer.bypassSecurityTrustStyle(
                           'linear-gradient(105deg, rgba(252,244,240,0.85) 0%, rgba(248,238,232,0.48) 48%, rgba(248,238,232,0.02) 100%)'
                         ),
        cta:             'Otkrijte Parfeme',
        ctaLink:         '/products',
      },
    ];
  }

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.autoPlayTimer = setInterval(() => this.nextSlide(), this.AUTO_PLAY_INTERVAL);
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  nextSlide(): void {
    this.goToSlide((this.currentSlide + 1) % this.slides.length);
  }

  prevSlide(): void {
    this.goToSlide((this.currentSlide - 1 + this.slides.length) % this.slides.length);
  }

  goToSlide(index: number): void {
    if (index === this.currentSlide || this.isAnimating) return;
    this.isAnimating = true;
    this.currentSlide = index;
    setTimeout(() => (this.isAnimating = false), 700);
  }

  onArrowNext(): void {
    this.nextSlide();
    this.resetAutoPlay();
  }

  onArrowPrev(): void {
    this.prevSlide();
    this.resetAutoPlay();
  }

  onDotClick(index: number): void {
    this.goToSlide(index);
    this.resetAutoPlay();
  }
}
