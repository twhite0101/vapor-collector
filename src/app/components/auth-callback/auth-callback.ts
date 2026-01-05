import { HttpClient } from '@angular/common/http'
import type { OnInit } from '@angular/core'
import { Component, inject } from '@angular/core'
import { Router } from '@angular/router'
import type { IsLoggedIn } from '../../models/Steam'
import { AuthService } from '../../services/auth/auth-service'

@Component({
  selector: 'app-auth-callback',
  imports: [],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.scss'
})
export class AuthCallback implements OnInit {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)
  private readonly authService: AuthService = inject(AuthService)
  private readonly router: Router = inject(Router)

  public ngOnInit (): void {
    this.http.get<IsLoggedIn>('http://localhost:3000/api/user-status', { withCredentials: true }).subscribe({
      next: (response: IsLoggedIn) => {
        if (response.loggedIn) {
          // User is logged in, store user data in a shared service
          // and redirect to the main application dashboard.
          this.authService.setUser(response.user)
          this.router.navigate(['/dashboard'])
        }
        else {
          // Not logged in, redirect to login page
          this.authService.removeUser()
          this.router.navigate(['/'])
        }
      },
      error: (error) => {
        console.error('Session check failed', error)
        this.router.navigate(['/'])
      }
    })
  }
}
