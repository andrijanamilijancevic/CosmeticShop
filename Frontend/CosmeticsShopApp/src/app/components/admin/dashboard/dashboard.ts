import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OrderService } from '../../../services/order';
import { ProductService } from '../../../services/product/product';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  stats = {
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0
  };
  recentOrders: any[] = [];

  constructor(
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.orderService.getAll(1, 5).subscribe({
      next: (res) => {
        this.stats.totalOrders = res.total;
        this.recentOrders = res.data;
        this.stats.totalRevenue = res.data.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      }
    });

    this.productService.getAll({ page: 1, pageSize: 1 }).subscribe({
      next: (res) => this.stats.totalProducts = res.total
    });
  }
}