import { NgOptimizedImage } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import type { IRecentlyPlayedGame } from '../../../../../models/Steam'

@Component({
  selector: 'app-recent-games',
  imports: [
    MatCardModule,
    NgOptimizedImage
  ],
  templateUrl: './recent-games.html',
  styleUrl: './recent-games.scss'
})
export class RecentGames {
  @Input({ required: true }) public recentlyPlayedGames: IRecentlyPlayedGame[]
}
