import { DatePipe, NgOptimizedImage } from '@angular/common'
import type { AfterViewInit, ElementRef, OnInit, WritableSignal } from '@angular/core'
import { Component, inject, signal, ViewChild } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatTabsModule } from '@angular/material/tabs'
import type { CarouselResponsiveOptions } from 'primeng/carousel'
import { CarouselModule } from 'primeng/carousel'
import type { IFriendsWhoPlay, IGameDialogInfo, IGameDialogPassedData, INewsItems, IUser, IUserGameInfo } from '../../../../models/Steam'
import { LoadingService } from '../../../../services/loading/loading-service'
import { StateService } from '../../../../services/state/state-service'
import { SteamService } from '../../../../services/steam/data/steam-service'

@Component({
  selector: 'app-game-dialog',
  imports: [
    NgOptimizedImage,
    CarouselModule,
    MatProgressBarModule,
    MatTabsModule,
    DatePipe
  ],
  templateUrl: './game-dialog.html',
  styleUrl: './game-dialog.scss'
})
export class GameDialog implements OnInit, AfterViewInit {
  // Dependency Injections
  private readonly dialogRef = inject(MatDialogRef<GameDialog>)
  private readonly data = inject<IGameDialogPassedData>(MAT_DIALOG_DATA)
  private readonly state: StateService = inject(StateService)
  private readonly loadingService: LoadingService = inject(LoadingService)
  private readonly steamService: SteamService = inject(SteamService)

  @ViewChild('details', { static: true }) protected detailsRef: ElementRef

  protected gameDetails: IGameDialogInfo
  protected user: IUser
  protected game: IUserGameInfo
  protected news: INewsItems[] = []
  protected friendsWhoPlay: IFriendsWhoPlay[] = []
  protected responsiveOptions: CarouselResponsiveOptions[] = []
  private _loading: WritableSignal<boolean> = signal(true)

  protected get loading () {
    return this._loading()
  }

  public ngOnInit (): void {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1
      }
    ]
  }

  public ngAfterViewInit (): void {
    this.dialogRef.afterOpened()
      .subscribe(() => {
        this.steamService.initializeGameInfo(this.data.game.appId.toString())
          .subscribe({
            next: ([gameNews, concurrentPlayers, gameSchema, userAchievements]) => {
              this.gameDetails = {
                user: this.data.user,
                game: this.data.game,
                news: gameNews.count > 0 ? this.steamService.mapGameNewsResponse(gameNews.newsitems) : [],
                friendsWhoPlay: this.steamService.findFriendsWhoPlayGame(this.data.game.appId, this.data.user.friendList),
                concurrentPlayers: concurrentPlayers,
                achievements: this.steamService.mapUserAchievements(gameSchema, userAchievements)
              }
              this._loading.set(false)
            },
            error: (err) => {
              console.error(err)
            }
          })
      })
  }

  protected onCloseClick = () => {
    this.dialogRef.close()
  }
}
