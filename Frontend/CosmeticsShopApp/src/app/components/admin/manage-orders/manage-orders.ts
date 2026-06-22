import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OrderService } from '../../../services/order';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './manage-orders.html',
  styleUrl: './manage-orders.css'
})
export class ManageOrdersComponent implements OnInit {
  orders: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  toastMsg = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.totalPages = Math.ceil(res.total / this.pageSize);
      }
    });
  }

  updateStatus(orderId: number, event: any): void {
    const status = event.target.value;
    if (!status) return;
    this.orderService.updateStatus(orderId, status).subscribe({
      next: () => { this.showToast('Status ažuriran!'); this.loadOrders(); },
      error: () => this.showToast('Greška!')
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 3000);
  }
}