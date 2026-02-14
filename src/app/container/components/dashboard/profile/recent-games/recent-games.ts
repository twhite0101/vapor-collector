import { NgOptimizedImage } from '@angular/common'
import type { OnInit } from '@angular/core'
import { Component, Input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { ImageFallback } from '../../../../../directives/image-fallback/image-fallback'
import type { IRecentlyPlayedGame } from '../../../../../models/Steam'

@Component({
  selector: 'app-recent-games',
  imports: [
    MatCardModule,
    NgOptimizedImage,
    ImageFallback
  ],
  templateUrl: './recent-games.html',
  styleUrl: './recent-games.scss'
})
export class RecentGames implements OnInit {
  @Input({ required: true }) public recentlyPlayedGames: IRecentlyPlayedGame[]

  protected displayedRecentGames: IRecentlyPlayedGame[] = []

  public ngOnInit (): void {
    this.displayedRecentGames.push(this.recentlyPlayedGames[0], this.recentlyPlayedGames[1], this.recentlyPlayedGames[2])
  }
}
