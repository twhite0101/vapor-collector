import type { OnInit } from '@angular/core'
import { Component, inject } from '@angular/core'
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
      this.authService.isTokenValid()
        .subscribe({
          next: (response) => {
            if (!response) {
              this.router.navigate(['/home/login'])
            }
            else {
              this.authService.setLoggedInStatus('true')
              this.authService.initializeUser()
            }
          },
          error: (err) => {
            console.error(err)
            this.authService.setUser(null)
            this.authService.setHasLibrary(false)
            this.authService.setHasBadges(false)
            this.router.navigate(['/home/login'])
          }
        })
    }
  }
}
