import { NgOptimizedImage } from '@angular/common'
import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { AuthService } from '../../services/auth/auth-service'

@Component({
  selector: 'app-home',
  imports: [
    MatButtonModule,
    NgOptimizedImage
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  // Dependency Injections
  private readonly authService: AuthService = inject(AuthService)

  protected loginClicked = () => {
    this.authService.login()
  }
}
