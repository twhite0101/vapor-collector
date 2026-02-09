import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common'
import type { OnInit } from '@angular/core'
import { Component, inject, Input } from '@angular/core'
import type { IUser } from '../../../../../models/Steam'
import { AuthService } from '../../../../../services/auth/auth-service'
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
  protected readonly authService: AuthService = inject(AuthService)

  @Input() public user: IUser

  // User
  protected avatars: string[]
  protected countryCode: string

  public ngOnInit (): void {
    if (this.user) {
      this.avatars = [
        this.user.avatars.avatarFull,
        this.user.avatars.avatar,
        this.user.avatars.avatarMedium
      ]
      this.countryCode = this.user.locCountryCode.toLowerCase()
    }
  }
}
