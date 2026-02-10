import type { OnInit } from '@angular/core'
import { Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '../services/auth/auth-service'

@Component({
  selector: 'app-auth-callback',
  imports: [],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.scss'
})
export class AuthCallback implements OnInit {
  // Dependency Injections
  private readonly router: Router = inject(Router)
  private readonly authService: AuthService = inject(AuthService)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute)

  private dataReturn = toSignal(this.activatedRoute.data)
  private isTokenValid = computed(() => this.dataReturn()?.['isTokenValid'] as boolean)

  public ngOnInit (): void {
    const lg = this.activatedRoute.snapshot.queryParamMap.get('lg')
    if (lg !== null) {
      this.authService.setLoggedInStatus(lg)
      if (this.authService.getLoggedInStatus()) {
        this.authService.initializeUser()
      }
      else {
        this.authService.setUser(null)
        this.authService.setHasLibrary(false)
        this.authService.setHasBadges(false)
        this.router.navigate(['/home/login'])
      }
    }
    else {
      if (this.isTokenValid() === false) {
        this.router.navigate(['/home/login'])
      }
      else {
        this.authService.setLoggedInStatus('true')
        this.authService.initializeUser()
      }
    }
  }
}
