export interface AdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Note: Your current backend GetAllUsers doesn't return Role yet, 
  // but we will prepare the frontend to receive it if you add it later.
  role?: string; 
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
}

export interface ChangeRoleRequest {
  newRole: string;
}