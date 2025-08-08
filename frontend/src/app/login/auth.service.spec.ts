// intelligram/frontend/src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private router: Router) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('user_id');
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getCurrentUsername(): string | null {
    return localStorage.getItem('username');
  }

  login(userId: string, username: string): void {
    localStorage.setItem('user_id', userId);
    localStorage.setItem('username', username);
    this.loggedIn.next(true);
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}