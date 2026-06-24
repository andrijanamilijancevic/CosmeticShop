import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart/cart';
import { OrderService } from '../../services/order';
import { HttpClient } from '@angular/common/http'; 

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalAmount = 0;
  couponCode = '';
  couponMsg = '';
  loading = false;
  toastMsg = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cartItems = res.items || [];
        this.totalAmount = res.totalAmount || 0;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  updateQuantity(cartItemId: number, productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(cartItemId);
      return;
    }
    this.cartService.updateQuantity(cartItemId, productId, quantity).subscribe({
      next: () => this.loadCart(),
      error: (err) => this.showToast(err.error || 'Greška!')
    });
  }

  removeItem(cartItemId: number): void {
    this.cartService.removeFromCart(cartItemId).subscribe({
      next: () => this.loadCart(),
      error: () => this.showToast('Greška pri uklanjanju!')
    });
  }

 applyCoupon() {
  if (!this.couponCode) return;

  this.http.get(`https://localhost:7298/api/Coupons/validate/${this.couponCode}`)
    .subscribe({
      next: (response: any) => {
        // response.discountPercent ti dolazi iz tvog DTO-a
        const discount = response.discountPercent;
        this.totalAmount = this.totalAmount - (this.totalAmount * (discount / 100));
        this.couponMsg = `Kupon primenjen! Popust: ${discount}%`;
      },
      error: () => {
        this.couponMsg = "Nevažeći kupon ili je istekao.";
      }
    });
}

  checkout(): void {
    this.orderService.createOrder(this.couponCode || undefined).subscribe({
      next: (res) => {
        this.orderService.createCheckoutSession(res.orderId).subscribe({
          next: (stripe) => {
            window.location.href = stripe.sessionUrl;
          },
          error: () => this.showToast('Greška pri Stripe plaćanju!')
        });
      },
      error: (err) => this.showToast(err.error || 'Greška pri kreiranju porudžbine!')
    });
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 3000);
  }
}