import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ProductService } from '../../services/product/product';
import { CartService } from '../../services/cart/cart';
import { WishlistService } from '../../services/wishlist';
import { AuthService } from '../../services/auth/auth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  reviews: any[] = [];
  quantity = 1;
  isLoggedIn = false;
  toastMsg = '';

  newReview = { rating: 5, comment: '' };

  private reviewsUrl = 'https://localhost:7298/api/Reviews';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!this.authService.getToken();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
      this.loadReviews(+id);
    }
  }

  loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (res) => this.product = res
    });
  }

  loadReviews(id: number): void {
    this.http.get<any[]>(`${this.reviewsUrl}/product/${id}`).subscribe({
      next: (res) => this.reviews = res
    });
  }

  addToCart(): void {
    if (!this.isLoggedIn) {
      this.showToast('Morate biti prijavljeni!');
      return;
    }
    this.cartService.addToCart(this.product.id, this.quantity).subscribe({
      next: () => this.showToast('Dodato u korpu! 🛒'),
      error: (err) => this.showToast(err.error || 'Greška!')
    });
  }

  toggleWishlist(): void {
    if (!this.isLoggedIn) {
      this.showToast('Morate biti prijavljeni!');
      return;
    }
    this.wishlistService.addToWishlist(this.product.id).subscribe({
      next: () => this.showToast('Dodato na wish listu! ♡'),
      error: () => this.wishlistService.removeFromWishlist(this.product.id).subscribe({
        next: () => this.showToast('Uklonjeno sa wish liste')
      })
    });
  }

  submitReview(): void {
    if (!this.newReview.comment) {
      this.showToast('Unesite komentar!');
      return;
    }
    this.http.post(this.reviewsUrl, {
      productId: this.product.id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe({
      next: () => {
        this.showToast('Recenzija dodata!');
        this.newReview = { rating: 5, comment: '' };
        this.loadReviews(this.product.id);
      },
      error: (err) => this.showToast(err.error || 'Greška!')
    });
  }
decreaseQuantity(): void {
  if (this.quantity > 1) this.quantity--;
}

increaseQuantity(): void {
  if (this.quantity < this.product.stockQuantity) this.quantity++;
}
  goBack(): void {
    this.location.back();
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 3000);
  }
}