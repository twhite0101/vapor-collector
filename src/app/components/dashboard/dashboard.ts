import type { OnInit, WritableSignal } from '@angular/core'
import { Component, inject, signal } from '@angular/core'
import type { IUser, IUserGameInfo } from '../../models/Steam'
import { AuthService } from '../../services/auth/auth-service'
import { SteamService } from '../../services/steam/data/steam-service'

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  // Dependency Injections
  protected readonly authService: AuthService = inject(AuthService)
  private readonly steamService: SteamService = inject(SteamService)

  protected user: IUser | null
  protected name: string
  private games: IUserGameInfo[]

  private _hasUser: WritableSignal<boolean> = signal(false)

  public ngOnInit (): void {
    if (!this.authService.user) {
      this.requestUser()
    }
    else {
      this.user = this.authService.user
      this.getGames()
      this._hasUser.set(true)
    }
  }

  protected logOutClicked = () => {
    this._hasUser.set(false)
    this.authService.logout()
  }

  private requestUser = async () => {
    const requestedUser = await this.authService.retrieveUser()
    if (requestedUser) {
      this.authService.setUser(requestedUser.user)
      if (this.authService.user) {
        this.user = this.authService.user
        this.getGames()
        this._hasUser.set(true)
      }
    }
  }

  protected get hasUser () {
    return this._hasUser()
  }

  private getGames = async () => {
    const response = await this.steamService.getOwnedGames()
    if (response) {
      this.games = response.games
      console.log(this.games)
    }
  }
}
