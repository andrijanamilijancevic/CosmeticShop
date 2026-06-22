import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7298/api/Auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private roleSubject = new BehaviorSubject<string>(this.getRole());

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getRole(): string {
    return localStorage.getItem('role') || '';
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => this.saveSession(res))
    );
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => this.saveSession(res))
    );
  }

  private saveSession(res: any): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    localStorage.setItem('fullName', res.fullName);
    localStorage.setItem('email', res.email);
    this.isLoggedInSubject.next(true);
    this.roleSubject.next(res.role);
  }

  logout(): void {
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.roleSubject.next('');
    this.router.navigate(['/']);
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'Admin';
  }

  getFullName(): string {
    return localStorage.getItem('fullName') || '';
  }
}