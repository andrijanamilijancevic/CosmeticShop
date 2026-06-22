import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://localhost:7298/api/Cart';

  constructor(private http: HttpClient) {}

  getCart(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(this.apiUrl, { productId, quantity });
  }

  updateQuantity(cartItemId: number, productId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cartItemId}`, { productId, quantity });
  }

  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartItemId}`);
  }

  clearCart(): Observable<any> {
    return this.http.delete(this.apiUrl);
  }
}