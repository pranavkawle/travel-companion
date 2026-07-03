import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoading()) {
    // Wait for auth to finish
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (!auth.isLoading()) {
          clearInterval(check);
          resolve(null);
        }
      }, 100);
    });
  }

  if (!auth.isAuthenticated()) {
    // Save target URL and trigger login
    localStorage.setItem('redirect_url', state.url);
    await auth.login();
    return false;
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAdmin();
};
