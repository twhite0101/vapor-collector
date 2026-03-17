import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common'
import type { OnInit, WritableSignal } from '@angular/core'
import { Component, inject, Input, signal } from '@angular/core'
import type { IPlayerLevel, IUser } from '../../../../../models/Steam'
import { StateService } from '../../../../../services/state/state-service'
import { SteamService } from '../../../../../services/steam/data/steam-service'
import { SteamLevel } from '../../../shared/steam-level/steam-level'

@Component({
  selector: 'app-nameplate',
  imports: [
    NgOptimizedImage,
    DatePipe,
    NgClass,
    SteamLevel
  ],
  templateUrl: './nameplate.html',
  styleUrl: './nameplate.scss'
})
export class Nameplate implements OnInit {
  // Dependency Injections
  private readonly state: StateService = inject(StateService)
  private readonly steamService: SteamService = inject(SteamService)

  @Input({ required: true }) public user: IUser

  // User
  protected avatars: string[]
  protected countryCode: string
  protected levelPercentile: number

  // Player Level
  private _playerLevel: WritableSignal<IPlayerLevel> = signal(this.steamService.createPlayerLevel())
  public get playerLevel () {
    return this._playerLevel()
  }

  public ngOnInit (): void {
    this._playerLevel.set(this.user.playerLevel as IPlayerLevel)
    this.avatars = [
      this.user.avatars.avatarFull,
      this.user.avatars.avatar,
      this.user.avatars.avatarMedium
    ]
    this.countryCode = this.user.locCountryCode !== undefined ? this.user.locCountryCode.toLowerCase() : 'NA'
    this.levelPercentile = (this.user.playerLevel as IPlayerLevel).levelPercentile
    this.state.setNamePlateStatus(true)
  }
}
