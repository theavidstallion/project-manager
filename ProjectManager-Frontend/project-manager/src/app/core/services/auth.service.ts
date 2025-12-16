import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { API_URL } from '../constants/constants';
import { User, LoginRequest, RegisterRequest } from '../models/auth.models';
import { pipe } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root'})

export class AuthService {
    router = inject(Router);
    private platformId = inject(PLATFORM_ID);
    apiUrl = API_URL;
    private http = inject(HttpClient);
    // Singal initialization
    private userSignal = signal< User | null>(null);
    // Current User is injected into this by userSignal.
    public currentUser = this.userSignal.asReadonly();
    // Used in components to get the signal (bool)
    readonly isLoggedIn = computed(() => !!this.userSignal());
    readonly isInitialized = signal(false);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            var token = localStorage.getItem('token');
            var userStr = localStorage.getItem('user');

            if (token && userStr) {
                this.userSignal.set(JSON.parse(userStr));
            } 
            this.isInitialized.set(true);
        }
        else {
            this.isInitialized.set(false);
        }
        
    }


    // Actions

    login(credentials: LoginRequest) {
        return this.http.post<User>(`${this.apiUrl}/account/login`, credentials)
            .pipe(
                tap((user: User) => {
                    this.userSignal.set(user);
                    
                    localStorage.setItem('token', user.token);
                    localStorage.setItem('user', JSON.stringify(user));
                })
            );
    }

    logout() {
        this.userSignal.set(null);

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');

        this.router.navigate(['/home']);
    }

    Register(credentials: RegisterRequest) {
        return this.http.post<User>(`${this.apiUrl}/account/register`, credentials);
    }

    confirmEmail(userId: string, token: string) {
        // Changed to POST request with body
        return this.http.post(`${this.apiUrl}/account/confirm-email`, { 
            userId, 
            token 
        });
    }

    // Add this inside AuthService class
    updateProfile(data: any) {
        return this.http.put(`${this.apiUrl}/account/profile`, data);
    }





}
