import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { AuthCallback } from './auth-callback/auth-callback/auth-callback';
import { Dashboard } from './dashboard/dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'auth-callback',
        component: AuthCallback
    },
    {
        path: 'dashboard',
        component: Dashboard
    },
];
