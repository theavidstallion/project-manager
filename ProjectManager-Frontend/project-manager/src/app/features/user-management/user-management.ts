import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { LoaderService } from '../../core/services/loader.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminUserResponse, CreateUserRequest } from '../../core/models/admin.models';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html'
})
export class UserManagement implements OnInit {
  
  adminService = inject(AdminService);
  loader = inject(LoaderService);
  toast = inject(ToastService);

  // Data
  users = signal<AdminUserResponse[]>([]);
  
  // Create User Form Data
  newUserObj: CreateUserRequest = {
    email: '', firstName: '', lastName: '', password: '', role: 'Member'
  };

  // Change Role Data
  selectedUser: AdminUserResponse | null = null;
  newRoleSelection: string = 'Member';

  // Modals
  @ViewChild('createUserModal') createModalRef!: ElementRef;
  @ViewChild('changeRoleModal') roleModalRef!: ElementRef;
  private createModalInstance: any;
  private roleModalInstance: any;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // this.loader.show();
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loader.hide();
      },
      error: (err) => {
        this.loader.hide();
        console.error(err);
      }
    });
  }

  // --- CREATE USER ---
  openCreateModal() {
    this.newUserObj = { email: '', firstName: '', lastName: '', password: '', role: 'Member' }; // Reset
    const el = this.createModalRef.nativeElement;
    this.createModalInstance = new bootstrap.Modal(el);
    this.createModalInstance.show();
  }

  onCreateUser() {
    this.loader.show();
    this.adminService.createUser(this.newUserObj).subscribe({
      next: () => {
        this.loader.hide();
        this.createModalInstance.hide();
        this.toast.show("User created successfully!");
        this.loadUsers();
      },
      error: (err) => {
        this.loader.hide();
        const msg = err.error?.message || "Failed to create user";
        this.toast.show(msg, 'error');
      }
    });
  }

  // --- DELETE USER ---
  onDeleteUser(user: AdminUserResponse) {
    Swal.fire({
      title: `Delete ${user.firstName}?`,
      text: "This cannot be undone and user will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545', // Danger Red
      cancelButtonColor: '#6c757d',  // Secondary Gray
      confirmButtonText: 'Yes, delete User!'
    }).then((result) => {
      if(result.isConfirmed) {
        //this.loader.show();
        this.adminService.deleteUser(user.id).subscribe({
          next: () => {
            this.loader.hide();
            // Show Success Alert
            Swal.fire({
              title: 'Deleted!',
              text: 'The user is deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadUsers();
          },
          error: (err) => {
            this.loader.hide();
            const msg = err.error?.message || "Failed to delete User.";
            
            Swal.fire('Error', msg, 'error');
          }
        });
      }
    });
  }

  // --- CHANGE ROLE ---
  openRoleModal(user: AdminUserResponse) {
    this.selectedUser = user;
    this.newRoleSelection = user.role || 'Member'; // Default to current or Member
    
    const el = this.roleModalRef.nativeElement;
    this.roleModalInstance = new bootstrap.Modal(el);
    this.roleModalInstance.show();
  }

  onChangeRole() {
    if (!this.selectedUser) return;

    this.loader.show();
    this.adminService.changeRole(this.selectedUser.id, this.newRoleSelection).subscribe({
      next: () => {
        this.loader.hide();
        this.roleModalInstance.hide();
        this.toast.show("Role updated successfully!");
        this.loadUsers();
      },
      error: (err) => {
        this.loader.hide();
        this.toast.show("Failed to update role.", 'error');
      }
    });
  }
}