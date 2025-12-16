import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { UserResponse } from '../models/user.models';
import { AdminUserResponse, CreateUserRequest, ChangeRoleRequest } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllUsers() {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/admin/users`);
  }

  createUser(data: CreateUserRequest) {
    return this.http.post(`${this.apiUrl}/admin/create-user`, data);
  }

  // 3. Delete User
  deleteUser(userId: string) {
    return this.http.delete(`${this.apiUrl}/admin/delete-user/${userId}`);
  }

  // 4. Change Role
  changeRole(userId: string, newRole: string) {
    const payload: ChangeRoleRequest = { newRole: newRole };
    return this.http.post(`${this.apiUrl}/admin/change-role/${userId}`, payload);
  }

}