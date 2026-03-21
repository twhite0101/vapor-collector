import { inject } from '@angular/core'
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router'
import { UserService } from '../services/user/user-service'

export const tokenResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(UserService).isTokenValid()
}
