import { inject } from '@angular/core'
import type { CanActivateFn } from '@angular/router'
import { UserService } from '../../services/user/user-service'

export const authGuard: CanActivateFn = (route, state) => {
  // Dependency Injections
  const userService: UserService = inject(UserService)
  return userService.isAuthenticated()
}
