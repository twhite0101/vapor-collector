import type { Routes } from '@angular/router'
import { AuthCallback } from './auth-callback/auth-callback'
import { AppContainer } from './container/components/app-container/app-container'
import { authGuard } from './guards/auth/auth-guard'
import { tokenResolver } from './resolvers/token.resolver'

export const routes: Routes = [
  {
    path: '',
    component: AuthCallback,
    resolve: {
      isTokenValid: tokenResolver
    }
  },
  {
    path: 'home',
    component: AppContainer,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./container/components/login/login').then(c => c.Login)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./container/components/dashboard/dashboard').then(c => c.Dashboard),
        canActivate: [authGuard]
      }
    ]
  }
]
