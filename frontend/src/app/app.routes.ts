import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Route for the main application dashboard, protected by authGussard
  // This means you must be logged in to access localhost:4200/
  { path: '', component: DashboardComponent, canActivate: [AuthGuard],pathMatch: 'full'},

  // Wildcard route: Redirects any unknown paths to the root ('/')
  // The root path is protected, so it will redirect to login if not authenticated.
  { path: '**', redirectTo: 'login' }
];
