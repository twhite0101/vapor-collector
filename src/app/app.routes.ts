import type { Routes } from '@angular/router'
import { AuthCallback } from './auth-callback/auth-callback'
import { AppContainer } from './container/components/app-container/app-container'
import { Dashboard } from './container/components/dashboard/dashboard'
import { Login } from './container/components/login/login'
import { authGuard } from './guards/auth/auth-guard'

export const routes: Routes = [
  {
    path: '',
    component: AuthCallback
  },
  {
    path: 'home',
    component: AppContainer,
    children: [
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
  }
]
