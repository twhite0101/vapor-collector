import { DatePipe, NgOptimizedImage } from '@angular/common'
import type { OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core'
import { booleanAttribute, Component, inject, Input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import type { CarouselResponsiveOptions } from 'primeng/carousel'
import { CarouselModule } from 'primeng/carousel'
import { ImageFallback } from '../../../../../directives/image-fallback/image-fallback'
import type { IDialogCarouselDisplayOptions } from '../../../../../models/Dialog'
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
export class RecentGames implements OnInit, OnDestroy, OnChanges {
  //Dependency Injections
  private readonly state: StateService = inject(StateService)
  private readonly dialog: MatDialog = inject(MatDialog)

  @Input({ required: true }) public recentlyPlayedGames: IUserGameInfo[]
  @Input({ required: true }) public user: IUser
  @Input({ required: true }) public recentPlayTime: number
  @Input({ transform: booleanAttribute }) public isFriend = false
  @Input() public dialogDisplayOptions: IDialogCarouselDisplayOptions

  protected responsiveOptions: CarouselResponsiveOptions[] = [
    {
      breakpoint: '1500',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '950',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '500',
      numVisible: 1,
      numScroll: 1
    }
  ]

  protected library: IUserGameInfo[] = []
  protected numVisible = 3
  protected numScroll = 1
  private resizeObserver!: ResizeObserver

  public ngOnInit (): void {
    this.library = this.user.gameLibrary
    this.state.setRecentGamesStatus(true)
  }

  public ngOnChanges (changes: SimpleChanges): void {
    if (changes['dialogDisplayOptions']?.currentValue) {
      this.responsiveOptions.length = 0
      this.numVisible = this.dialogDisplayOptions.numVisible
      this.numScroll = this.dialogDisplayOptions.numScroll
    }
  }

  public ngOnDestroy (): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
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
