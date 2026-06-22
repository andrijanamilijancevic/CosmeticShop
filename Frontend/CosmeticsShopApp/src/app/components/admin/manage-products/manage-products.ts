import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProductService } from '../../../services/product/product';
import { CategoryService } from '../../../services/category/category';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './manage-products.html',
  styleUrl: './manage-products.css'
})
export class ManageProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  showForm = false;
  editingId: number | null = null;
  errorMsg = '';
  toastMsg = '';
  imagePreview: string = '';
  uploadStatus: string = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  form = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    imageUrl: '',
    brand: '',
    categoryId: ''
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private http: HttpClient

  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getAll({ page: this.currentPage, pageSize: this.pageSize }).subscribe({
      next: (res) => {
        this.products = res.data;
        this.totalPages = Math.ceil(res.total / this.pageSize);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res
    });
  }

  openForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.form = { name: '', description: '', price: 0, stockQuantity: 0, imageUrl: '', brand: '', categoryId: '' };
  }

  editProduct(p: any): void {
    this.showForm = true;
    this.editingId = p.id;
    this.form = {
      name: p.name,
      description: p.description,
      price: p.price,
      stockQuantity: p.stockQuantity,
      imageUrl: p.imageUrl,
      brand: p.brand,
      categoryId: p.categoryId
    };
    this.imagePreview = p.imageUrl || '';
  }

  saveProduct(): void {
    this.errorMsg = '';
    if (this.editingId) {
      this.productService.update(this.editingId, { ...this.form, isActive: true }).subscribe({
        next: () => { this.showToast('Proizvod ažuriran!'); this.closeForm(); this.loadProducts(); },
        error: (err) => this.errorMsg = err.error || 'Greška!'
      });
    } else {
      this.productService.create(this.form).subscribe({
        next: () => { this.showToast('Proizvod dodat!'); this.closeForm(); this.loadProducts(); },
        error: (err) => this.errorMsg = err.error || 'Greška!'
      });
    }
  }

  deleteProduct(id: number): void {
    if (!confirm('Da li ste sigurni?')) return;
    this.productService.delete(id).subscribe({
      next: () => { this.showToast('Proizvod obrisan!'); this.loadProducts(); },
      error: () => this.showToast('Greška pri brisanju!')
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.errorMsg = '';
    this.imagePreview = '';
    this.uploadStatus = '';
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 3000);
  }
  onImageSelected(event: any): void {
  const file = event.target.files[0];
  if (!file) return;

  // Preview
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.imagePreview = e.target.result;
  };
  reader.readAsDataURL(file);

  // Upload
  this.uploadStatus = 'Uploadovanje...';
  const formData = new FormData();
  formData.append('file', file);

  this.http.post<any>('https://localhost:7298/api/Products/upload-image', formData).subscribe({
    next: (res) => {
      this.form.imageUrl = res.imageUrl;
      this.uploadStatus = '✓ Slika uspešno uploadovana!';
    },
    error: (err) => {
      this.uploadStatus = '✗ Greška: ' + (err.error || 'Pokušajte ponovo');
    }
  });
}
}