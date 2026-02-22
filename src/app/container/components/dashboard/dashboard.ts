import type { OnInit } from '@angular/core'
import { Component, inject } from '@angular/core'
import type { IUser, IUserGameInfo } from '../../../models/Steam'
import { AuthService } from '../../../services/auth/auth-service'
import { Nameplate } from './profile/nameplate/nameplate'
import { RecentGames } from './profile/recent-games/recent-games'
import { Sidebar } from './profile/sidebar/sidebar'

@Component({
  selector: 'app-dashboard',
  imports: [
    Nameplate,
    RecentGames,
    Sidebar
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  protected readonly authService: AuthService = inject(AuthService)

  protected user: IUser
  protected recentlyPlayedGames: IUserGameInfo[] = []
  protected recentPlayTime: number

  public ngOnInit (): void {
    if (this.authService.hasUser) {
      this.user = this.authService.user as IUser
      this.recentlyPlayedGames = this.user.gameLibrary.slice(0, this.user.gameCount >= 20 ? 20 : this.user.gameCount)
      this.recentPlayTime = this.authService.calculateRecentPlayTime(this.recentlyPlayedGames)
    }
  }
}
