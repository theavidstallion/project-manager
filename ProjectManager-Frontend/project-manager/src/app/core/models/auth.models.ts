export interface User {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}