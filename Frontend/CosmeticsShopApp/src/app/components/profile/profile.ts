import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  user: any = null;
  orders: any[] = [];
  initials = '';
  toastMsg = '';

  editForm = { firstName: '', lastName: '' };
  passwordForm = { oldPassword: '', newPassword: '' };

  private apiUrl = 'https://localhost:7298/api/Users';

  constructor(
    private http: HttpClient,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadOrders();
  }

  loadProfile(): void {
    this.http.get<any>(`${this.apiUrl}/me`).subscribe({
      next: (res) => {
        this.user = res;
        this.editForm.firstName = res.firstName;
        this.editForm.lastName = res.lastName;
        this.initials = `${res.firstName[0]}${res.lastName[0]}`.toUpperCase();
      }
    });
  }

  loadOrders(): void {
    this.orderService.getAll().subscribe({
      next: (res) => this.orders = res.data
    });
  }

  updateProfile(): void {
    this.http.put(`${this.apiUrl}/me`, this.editForm, { responseType: 'text' }).subscribe({
      next: (res) => this.showToast(res || 'Profil ažuriran!'),
      error: () => this.showToast('Greška pri ažuriranju!')
    });
  }

  changePassword(): void {
   this.http.put(`${this.apiUrl}/me/password`, this.passwordForm, { responseType: 'text' }).subscribe({
      next: (res) => {
        this.showToast(res || 'Lozinka promenjena!');
        this.passwordForm = { oldPassword: '', newPassword: '' };
      },
      error: (err) => this.showToast(err.error || 'Greška!')
    });
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 3000);
  }
}