import { DatePipe, NgOptimizedImage } from '@angular/common'
import type { OnInit } from '@angular/core'
import { Component, inject, Input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { CarouselModule } from 'primeng/carousel'
import { ImageFallback } from '../../../../../directives/image-fallback/image-fallback'
import type { IRecentlyPlayedGame } from '../../../../../models/Steam'
import { StateService } from '../../../../../services/state/state-service'

@Component({
  selector: 'app-recent-games',
  imports: [
    MatCardModule,
    NgOptimizedImage,
    ImageFallback,
    DatePipe,
    CarouselModule
  ],
  templateUrl: './recent-games.html',
  styleUrl: './recent-games.scss'
})
export class RecentGames implements OnInit {
  //Dependency Injections
  private readonly state: StateService = inject(StateService)

  @Input({ required: true }) public recentlyPlayedGames: IRecentlyPlayedGame[]
  @Input({ required: true }) public recentPlayTime: number

  protected displayedRecentGames: IRecentlyPlayedGame[] = []

  public ngOnInit (): void {
    this.displayedRecentGames.push(this.recentlyPlayedGames[0], this.recentlyPlayedGames[1], this.recentlyPlayedGames[2])
    this.state.setRecentGamesStatus(true)
  }
}
