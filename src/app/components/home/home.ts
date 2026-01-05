import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { SteamService } from '../../services/steam/steam-service'

@Component({
  selector: 'app-home',
  imports: [
    MatButtonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  // Dependency Injections
  private readonly steamService: SteamService = inject(SteamService)

  protected loginClicked = () => {
    this.steamService.login()
  }
}
