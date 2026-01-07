import type { OnInit } from '@angular/core'
import { Component, inject } from '@angular/core'
import type { IUser } from '../../models/Steam'
import { LocalStorageService } from '../../services/localStorage/local-storage-service'
import { SteamService } from '../../services/steam/steam-service'

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  // Dependency Injections
  private readonly localStorage: LocalStorageService = inject(LocalStorageService)
  private readonly steamService: SteamService = inject(SteamService)

  protected user: IUser | null
  protected name: string

  public ngOnInit (): void {
    this.user = this.localStorage.getItem('user')
  }

  protected logOutClicked = () => {
    this.steamService.logout()
  }
}
