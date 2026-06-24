import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promo-banner.html',
  styleUrl: './promo-banner.css'
})
export class PromoBannerComponent {
  visible = true;

  dismiss(): void {
    this.visible = false;
  }
}
