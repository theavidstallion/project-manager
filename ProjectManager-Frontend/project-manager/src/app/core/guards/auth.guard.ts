import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; 
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service'; // Import Toast

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService); // Inject Toast
  const platformId = inject(PLATFORM_ID);

  // 1. SSR CHECK
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // 2. CHECK LOGIN
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 3. CHECK ROLE (The New Part)
  const requiredRole = route.data['role'] as string; // Read from app.routes.ts
  const userRole = authService.currentUser()?.role;

  // If the route has a "role" requirement...
  if (requiredRole) {
    
    // ...and the user's role doesn't match
    // (Note: You could expand this to arrays if you want multiple roles allowed)
    if (userRole !== requiredRole) {
      
      toast.show("Access Denied: You do not have permission.", 'error');
      router.navigate(['/dashboard']); // Kick them back to safety
      return false;
    }
  }

  // If we passed all checks
  return true;
};