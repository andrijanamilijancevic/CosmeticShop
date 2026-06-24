import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://localhost:7298/api/Cart';
  
  // Ponovo vraćamo živu vezu za Navbar brojčanik
  private cartItemsSubject = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {
    // Čim se aplikacija pokrene, povuci stanje iz baze
    this.loadCartFromServer();
  }

  // Pomoćna metoda koja puni Navbar u realnom vremenu podatkom iz baze
  public loadCartFromServer(): void {
    this.http.get(this.apiUrl).subscribe({
      next: (res: any) => {
        this.cartItemsSubject.next(res.items || []);
      },
      error: () => this.cartItemsSubject.next([])
    });
  }

  // OVO TRAŽI TVOJ NAVBAR DA BI PRIKAZAO 1, 2, 3...
  getCartItems$(): Observable<any[]> {
    return this.cartItemsSubject.asObservable();
  }

  // Čitanje korpe za stranicu korpe
  getCart(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      tap((res: any) => this.cartItemsSubject.next(res.items || []))
    );
  }

  // Dodavanje u bazu + automatsko osvežavanje broja na Navbaru
  addToCart(product: any, quantity: number = 1): Observable<any> {
    const payload = {
      productId: product.id,
      quantity: quantity
    };
    return this.http.post(this.apiUrl, payload, { responseType: 'text' }).pipe(
      tap(() => this.loadCartFromServer()) // <--- Ovo pali ponovo brojčanik!
    );
  }

  // Izmjena količine + osvežavanje broja
  updateQuantity(cartItemId: number, productId: number, quantity: number): Observable<any> {
    const payload = {
      productId: productId,
      quantity: quantity
    };
    return this.http.put(`${this.apiUrl}/${cartItemId}`, payload, { responseType: 'text' }).pipe(
      tap(() => this.loadCartFromServer())
    );
  }

  // Brisanje + osvežavanje broja
  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartItemId}`, { responseType: 'text' }).pipe(
      tap(() => this.loadCartFromServer())
    );
  }

  // Pražnjenje
  clearCart(): Observable<any> {
    return this.http.delete(this.apiUrl, { responseType: 'text' }).pipe(
      tap(() => this.cartItemsSubject.next([]))
    );
  }
}