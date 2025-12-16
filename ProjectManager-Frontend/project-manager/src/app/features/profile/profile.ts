import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-5" style="max-width: 800px;">
      
      <div class="mb-4">
        <a routerLink="/dashboard" class="text-decoration-none text-secondary">
          <i class="bi bi-arrow-left"></i> Back to Dashboard
        </a>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h4 class="mb-0 fw-bold">My Profile</h4>
        </div>
        <div class="card-body p-4">
          <form (ngSubmit)="onUpdateProfile()">
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">First Name</label>
                <input type="text" class="form-control" [(ngModel)]="profileForm.firstName" name="fName">
              </div>
              <div class="col-md-6">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-control" [(ngModel)]="profileForm.lastName" name="lName">
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-control bg-light" [(ngModel)]="profileForm.email" name="email" readonly>
              <div class="form-text">Email cannot be changed directly.</div>
            </div>

            <div class="mb-4">
              <label class="form-label">Phone Number</label>
              <input type="tel" class="form-control" [(ngModel)]="profileForm.phoneNumber" name="phone">
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted small">User ID: {{ userIdDisplay }}</span>
              <button type="submit" class="btn btn-primary px-4">
                <i class="bi bi-save me-1"></i> Update Profile
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  toast = inject(ToastService);
  
  userIdDisplay = '';
  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  };

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.userIdDisplay = user.userId;
      this.profileForm = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.username || '',
        phoneNumber: user.phoneNumber || '' 
      };
    }
  }

  onUpdateProfile() {
    this.authService.updateProfile(this.profileForm).subscribe({
      next: () => this.toast.show('Profile updated successfully!'),
      error: () => this.toast.show('Failed to update profile', 'error')
    });
  }
}