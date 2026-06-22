import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth';
import { CartService } from '../../services/cart/cart';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;
  cartCount: number = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isAdmin$ = new Observable(observer => {
      this.authService.role$.subscribe(role => {
        observer.next(role === 'Admin');
      });
    });

    if (this.authService.getToken() && localStorage.getItem('role') === 'Customer') {
      this.loadCartCount();
    }
  }

  loadCartCount(): void {
    this.cartService.getCart().subscribe({
      next: (res) => this.cartCount = res.items?.length || 0,
      error: () => this.cartCount = 0
    });
  }

  logout(): void {
    this.authService.logout();
  }
}