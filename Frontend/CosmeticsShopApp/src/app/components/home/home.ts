import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeroBanner } from '../hero-banner/hero-banner';
import { ProductService } from '../../services/product/product';

export interface HomeProduct {
  id: number;
  name: string;
  category: string;
  cardBg: string;
  routerLink: string;
  isNew: boolean;
  imageUrl: string; // ← dodato
}

const CARD_BACKGROUNDS = [
  'linear-gradient(135deg, #fde8f0 0%, #fcd6e8 100%)',
  'linear-gradient(135deg, #fdf3e3 0%, #fce8c8 100%)',
  'linear-gradient(135deg, #e8f4fd 0%, #d6e8fc 100%)',
  'linear-gradient(135deg, #f0fde8 0%, #e0f7d0 100%)',
  'linear-gradient(135deg, #f3e8fd 0%, #e8d6fc 100%)',
];

const NEW_THRESHOLD_DAYS = 30;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, HeroBanner],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  @ViewChild('productTrack') productTrack!: ElementRef<HTMLDivElement>;

  products: HomeProduct[] = [];
  isLoading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadLatestProducts();
  }

  private loadLatestProducts(): void {
    this.productService.getAll({
      sortBy: 'newest',
      pageSize: 10,
      page: 1
    }).subscribe({
      next: (response: any) => {
        const items = Array.isArray(response)
          ? response
          : (response.items ?? response.data ?? response.products ?? []);

        this.products = items.map((p: any, index: number) => ({
          id: p.id,
          name: p.name,
          category: p.categoryName ?? p.category?.name ?? p.category ?? '',
          cardBg: CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length],
          routerLink: `/products/${p.id}`,
          isNew: this.isNewProduct(p.createdAt ?? p.dateAdded ?? p.created ?? p.createdDate),
          imageUrl: p.imageUrl ? 'https://localhost:7298/images/' + p.imageUrl : '/assets/placeholder.png', // ← dodato
        }));

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Greška pri učitavanju proizvoda:', err);
        this.isLoading = false;
      }
    });
  }

  private isNewProduct(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    const created = new Date(dateStr);
    const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= NEW_THRESHOLD_DAYS;
  }

  scrollProducts(direction: 'left' | 'right' | string): void {
    const track = this.productTrack?.nativeElement;
    if (!track) return;
    const scrollAmount = 304;
    track.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  }
}