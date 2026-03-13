import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common'
import type { OnInit } from '@angular/core'
import { Component, inject, Input } from '@angular/core'
import type { IUser } from '../../../../../models/Steam'
import { StateService } from '../../../../../services/state/state-service'
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

  @Input({ required: true }) public user: IUser

  // User
  protected avatars: string[]
  protected countryCode: string
  protected levelPercentile: number

  public ngOnInit (): void {
    this.avatars = [
      this.user.avatars.avatarFull,
      this.user.avatars.avatar,
      this.user.avatars.avatarMedium
    ]
    this.countryCode = this.user.locCountryCode !== undefined ? this.user.locCountryCode.toLowerCase() : 'NA'
    this.levelPercentile = this.user.playerLevel.levelPercentile
    this.state.setNamePlateStatus(true)
  }
}
