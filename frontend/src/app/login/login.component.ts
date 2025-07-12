// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth-service.service'; // Import the new AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private router: Router, private authService: AuthService) {} // Inject AuthService

  email: string = '';
  password: string = '';
  showError: string = '';

  onSubmit(): void {
    this.showError = '';

    if (!this.email.trim()) {
      this.showError = 'Please Input Your Email';
      return;
    }

    if (!this.password.trim()) {
      this.showError = 'Please Input Your Password';
      return;
    }

    // Use AuthService to perform login
    if (this.authService.login(this.email, this.password)) {
      console.log('Login successful');
      this.router.navigate(['/'], { replaceUrl: true }); // Redirect to home
    } else {
      this.showError = 'Invalid login';
    }
  }
}
