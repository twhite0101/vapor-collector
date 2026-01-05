import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { AuthCallback } from './components/auth-callback/auth-callback';
import { Dashboard } from './components/dashboard/dashboard';

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
