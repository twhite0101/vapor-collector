import type { Routes } from '@angular/router'
import { AuthCallback } from './components/auth-callback/auth-callback'
import { Dashboard } from './components/dashboard/dashboard'
import { Home } from './components/home/home'

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
  }
]
