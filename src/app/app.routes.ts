import type { Routes } from '@angular/router'
import { AuthCallback } from './components/auth-callback/auth-callback'
import { Dashboard } from './components/dashboard/dashboard'
import { Login } from './components/login/login'
import { authGuard } from './guards/auth/auth-guard'

export const routes: Routes = [
  {
    path: '',
    component: AuthCallback
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  }
]
