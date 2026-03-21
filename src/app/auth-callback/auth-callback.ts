import type { OnInit } from '@angular/core'
import { Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { UserService } from '../services/user/user-service'

@Component({
  selector: 'app-auth-callback',
  imports: [],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.scss'
})
export class AuthCallback implements OnInit {
  // Dependency Injections
  private readonly router: Router = inject(Router)
  private readonly userService: UserService = inject(UserService)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute)

  private dataReturn = toSignal(this.activatedRoute.data)
  private isTokenValid = computed(() => this.dataReturn()?.['isTokenValid'] as boolean)

  public ngOnInit (): void {
    const lg = this.activatedRoute.snapshot.queryParamMap.get('lg')
    if (lg !== null) {
      this.userService.setLoggedInStatus(lg)
      if (this.userService.getLoggedInStatus()) {
        this.userService.initializeUser()
      }
      else {
        this.userService.setUser(null)
        this.userService.setHasLibrary(false)
        this.userService.setHasBadges(false)
        this.router.navigate(['/home/login'])
      }
    }
    else {
      if (this.isTokenValid() === false) {
        this.router.navigate(['/home/login'])
      }
      else {
        this.userService.setLoggedInStatus('true')
        this.userService.initializeUser()
      }
    }
  }
}
