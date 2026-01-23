import { inject } from '@angular/core'
import type { CanActivateFn } from '@angular/router'
import { AuthService } from '../../services/auth/auth-service'

export const authGuard: CanActivateFn = (route, state) => {
  // Dependency Injections
  const authService: AuthService = inject(AuthService)
  return authService.isAuthenticated()
}
