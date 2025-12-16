import { Routes } from '@angular/router';
import { Home } from '../app/features/home/home';
import { Dashboard } from '../app/features/dashboard/dashboard';
import { Login } from '../app/features/login/login';
import { Register } from '../app/features/register/register';
import { ConfirmEmail } from '../app/features/confirm-email/confirm-email';
import { ProjectDetails } from '../app/features/project-details/project-details';
import { UserManagement } from '../app/features/user-management/user-management';
import { authGuard } from './core/guards/auth.guard';
import { Profile } from './features/profile/profile';
import { ActivityLogs } from './features/activity-logs/activity-logs';

export const routes: Routes = [
    // Home Page (Default)
    {
        path: '',
        component: Home,
        pathMatch: 'full'
    },
    // Dashboard Page
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard]
    },
    // Login Page
    {
        path: 'login',
        component: Login
    },
    // Register Page
    {
        path: 'register',
        component: Register
    },
    // Confirm-Email route
    {
        path: 'confirm-email',
        component: ConfirmEmail
    },
    {
        path: 'projects/:id',
        component: ProjectDetails,
        canActivate: [authGuard]
    },

    { 
        path: 'users', 
        component: UserManagement, 
        canActivate: [authGuard],
        data: { role: 'Admin' }
    },
    { 
        path: 'activity-logs', 
        component: ActivityLogs,
        canActivate: [authGuard],
        data: { role: 'Admin' } 
    },
    { 
        path: 'profile', 
        component: Profile, 
        canActivate: [authGuard] 
    },

    // Garbage Route
    {
        path: '**',
        redirectTo: ''
    }


];
