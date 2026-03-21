import type { OnInit } from '@angular/core'
import { Component, inject } from '@angular/core'
import type { IUser, IUserGameInfo } from '../../../models/Steam'
import { SteamService } from '../../../services/steam/data/steam-service'
import { UserService } from '../../../services/user/user-service'
import { ValueDetails } from '../shared/value-details/value-details'
import { Nameplate } from './profile/nameplate/nameplate'
import { RecentGames } from './profile/recent-games/recent-games'
import { Sidebar } from './profile/sidebar/sidebar'

@Component({
  selector: 'app-dashboard',
  imports: [
    Nameplate,
    RecentGames,
    Sidebar,
    ValueDetails
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  protected readonly userService: UserService = inject(UserService)
  protected readonly steamService: SteamService = inject(SteamService)

  protected user: IUser
  protected recentlyPlayedGames: IUserGameInfo[] = []
  protected recentPlayTime: number

  public ngOnInit (): void {
    if (this.userService.hasUser) {
      this.user = this.userService.user as IUser
      this.recentlyPlayedGames = this.user.gameLibrary.slice(0, this.user.gameCount >= 20 ? 20 : this.user.gameCount)
      this.recentPlayTime = this.steamService.calculateRecentPlayTime(this.recentlyPlayedGames)
    }
  }
}
