import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css'
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  search = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  toastMsg = '';

  private apiUrl = 'https://localhost:7298/api/Users';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<any>(`${this.apiUrl}?search=${this.search}&page=${this.currentPage}&pageSize=${this.pageSize}`).subscribe({
      next: (res) => {
        this.users = res.data;
        this.totalPages = Math.ceil(res.total / this.pageSize);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  deleteUser(id: number): void {
    if (!confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) return;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => { this.showToast('Korisnik obrisan!'); this.loadUsers(); },
      error: () => this.showToast('Greška pri brisanju!')
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 3000);
  }
}