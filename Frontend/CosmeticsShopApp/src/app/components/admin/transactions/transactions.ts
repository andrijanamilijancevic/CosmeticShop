import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OrderService } from '../../../services/order';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.orderService.getTransactions(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.transactions = res.data;
        this.totalPages = Math.ceil(res.total / this.pageSize);
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }
}