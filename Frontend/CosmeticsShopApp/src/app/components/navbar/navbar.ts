import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;
  cartCount: number = 0;

  /** True once the page has scrolled past the hero — triggers denser glass */
  isScrolled: boolean = false;

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
    this.loadCartCount();
    
  }

  ngOnDestroy(): void {
    // No manual cleanup needed — HostListener is removed automatically
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  loadCartCount(): void {
    this.cartService.getCartItems$().subscribe({
      next: (items) => this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0),
      error: () => this.cartCount = 0
    });
  }

  logout(): void {
    this.authService.logout();
  }
}