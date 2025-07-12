// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false); // Initial state: not logged in

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  constructor(private router: Router) {
    // Check if user is already logged in (e.g., from localStorage)
    const token = localStorage.getItem('authToken');
    if (token) {
      this.loggedIn.next(true);
    }
  }

  login(username: string, password: string): boolean {
    // In a real app, you'd send an HTTP request to your backend here.
    // For demonstration, let's just use dummy credentials.
    if (username === 'admin@gmail.com' && password === 'Password@123') {
      // Simulate successful login
      localStorage.setItem('authToken', 'some-jwt-token'); // Store a token
      this.loggedIn.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('authToken'); // Clear token
    this.loggedIn.next(false);
    this.router.navigate(['/login']); // Redirect to login page after logout
  }
}
