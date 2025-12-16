import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  templateUrl: './confirm-email.html'
})
export class ConfirmEmail implements OnInit {
  
  route = inject(ActivatedRoute);
  router = inject(Router);
  authService = inject(AuthService);

  status: 'loading' | 'success' | 'error' = 'loading';

  ngOnInit() {
      // 1. Capture the parameters from the URL (the link in the email)
      const userId = this.route.snapshot.queryParams['userId'];
      const token = this.route.snapshot.queryParams['token'];

      // 2. Validate we actually got them
      if (!userId || !token) {
          this.status = 'error';
          console.error('Missing userId or token');
          return;
      }

      // 3. Call the Backend (now POST)
      this.authService.confirmEmail(userId, token).subscribe({
          next: (response: any) => {
              console.log('Email confirmed:', response);
              this.status = 'success';
              // Optional: Redirect automatically after 3 seconds
              setTimeout(() => this.router.navigate(['/login']), 3000);
          },
          error: (err) => {
              console.error('Confirmation failed:', err);
              this.status = 'error';
          }
      });
  }

}