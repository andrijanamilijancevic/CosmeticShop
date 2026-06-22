import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product/product';
import { CategoryService } from '../../services/category/category';
import { CartService } from '../../services/cart/cart';
import { AuthService } from '../../services/auth/auth';
import { WishlistService } from '../../services/wishlist';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  wishlistIds: number[] = [];
  search = '';
  selectedCategory = '';
  sortBy = 'name';
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  loading = false;
  toastMsg = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        this.selectedCategory = params['categoryId'];
      }
      this.loadCategories();
      this.loadProducts();
      this.loadWishlistIds();
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res,
      error: () => {}
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll({
      search: this.search,
      categoryId: this.selectedCategory,
      sortBy: this.sortBy,
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        this.products = res.data;
        this.totalPages = Math.ceil(res.total / this.pageSize);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onFilter(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  addToCart(product: any): void {
    if (!this.authService.getToken()) {
      this.showToast('Morate biti prijavljeni da biste dodali u korpu!');
      return;
    }
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => this.showToast(`${product.name} dodat u korpu! 🛒`),
      error: (err) => this.showToast(err.error || 'Greška!')
    });
  }

  toggleWishlist(productId: number): void {
  if (!this.authService.getToken()) {
    this.showToast('Morate biti prijavljeni!');
    return;
  }
  this.wishlistService.addToWishlist(productId).subscribe({
    next: () => {
      this.showToast('Dodato na wish listu! ♡');
      this.loadWishlistIds();
    },
    error: (err) => {
      if (err.status === 400) {
        this.wishlistService.removeFromWishlist(productId).subscribe({
          next: () => {
            this.showToast('Uklonjeno sa wish liste');
            this.loadWishlistIds();
          }
        });
      } else {
        this.showToast('Greška!');
      }
    }
  });
}

  onImgError(event: any): void {
    event.target.src = 'assets/placeholder.png';
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 3000);
  }
  loadWishlistIds(): void {
  if (!this.authService.getToken()) return;
  this.wishlistService.getWishlist().subscribe({
    next: (res) => this.wishlistIds = res.map((p: any) => p.id),
    error: () => {}
  });
}
}