import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Login is disabled for now: the dashboard is open to everyone.
// To re-enable it, import LoginComponent and AuthGuard, add { path: 'login', component: LoginComponent },
// add canActivate: [AuthGuard] to the '' route, and point the wildcard back to 'login'.
export const routes: Routes = [
  // Main application dashboard (homepage)
  { path: '', component: DashboardComponent, pathMatch: 'full' },

  // Wildcard route: Redirects any unknown paths (including the old /login) to the homepage
  { path: '**', redirectTo: '' }
];
