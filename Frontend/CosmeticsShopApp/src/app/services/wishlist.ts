import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = 'https://localhost:7298/api/Wishlist';

  constructor(private http: HttpClient) {}

  getWishlist(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addToWishlist(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}`, {});
  }

  removeFromWishlist(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`);
  }
}