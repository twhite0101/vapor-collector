import { NgOptimizedImage } from '@angular/common'
import type { OnInit } from '@angular/core'
import { Component, inject } from '@angular/core'
import { NonNullableFormBuilder } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import type { IUser } from '../../../../models/Steam'
import { AuthService } from '../../../../services/auth/auth-service'
import { StateService } from '../../../../services/state/state-service'

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    NgOptimizedImage
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  // Dependency Injections
  protected readonly authService: AuthService = inject(AuthService)
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private readonly state: StateService = inject(StateService)

  protected user: IUser | null
  protected name: string

  public ngOnInit (): void {
    if (this.authService.hasUser) {
      this.user = this.authService.user
    }
    this.state.setHeaderStatus(true)
  }

  protected loginClicked = () => {
    this.authService.login()
  }

  protected logOutClicked = () => {
    this.authService.logout()
  }
}
