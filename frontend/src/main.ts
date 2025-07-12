import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // Updated import
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Assuming you have routes, even if empty

export const appConfig: ApplicationConfig = {
  providers: [
      provideRouter(routes),
      provideHttpClient(withInterceptorsFromDi()) // Configure HttpClient
  ]
};


bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));