import type { OnInit } from '@angular/core'
import { Component, inject } from '@angular/core'
import type { IUser } from '../../../models/Steam'
import { AuthService } from '../../../services/auth/auth-service'
import { Nameplate } from './profile/nameplate/nameplate'
import { RecentGames } from './profile/recent-games/recent-games'

@Component({
  selector: 'app-dashboard',
  imports: [
    Nameplate,
    RecentGames
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  protected readonly authService: AuthService = inject(AuthService)

  protected user: IUser

  public ngOnInit (): void {
    if (this.authService.hasUser) {
      this.user = this.authService.user as IUser
    }
  }
}
