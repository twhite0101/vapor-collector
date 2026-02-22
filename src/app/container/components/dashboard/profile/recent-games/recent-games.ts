import { DatePipe, NgOptimizedImage } from '@angular/common'
import type { OnInit } from '@angular/core'
import { Component, inject, Input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import { CarouselModule } from 'primeng/carousel'
import { ImageFallback } from '../../../../../directives/image-fallback/image-fallback'
import type { IUser, IUserGameInfo } from '../../../../../models/Steam'
import { StateService } from '../../../../../services/state/state-service'
import { GameDialog } from '../../../shared/game-dialog/game-dialog'

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
  private readonly dialog: MatDialog = inject(MatDialog)

  @Input({ required: true }) public recentlyPlayedGames: IUserGameInfo[]
  @Input({ required: true }) public user: IUser
  @Input({ required: true }) public recentPlayTime: number

  protected library: IUserGameInfo[] = []

  public ngOnInit (): void {
    this.library = this.user.gameLibrary
    this.state.setRecentGamesStatus(true)
  }

  protected openGameDialog = (game: IUserGameInfo) => {
    const dialogConfig = new MatDialogConfig()
    dialogConfig.data = {
      game: game,
      user: this.user
    }
    dialogConfig.panelClass = 'game-dialog'
    this.dialog.open(GameDialog, dialogConfig)
  }
}
