import { DatePipe, NgOptimizedImage } from '@angular/common'
import type { AfterViewInit, ElementRef, WritableSignal } from '@angular/core'
import { Component, inject, signal, ViewChild } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { CarouselModule } from 'primeng/carousel'
import type { IGameDialogInfo, IGameDialogPassedData } from '../../../../models/Steam'
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
export class GameDialog implements AfterViewInit {
  // Dependency Injections
  private readonly dialogRef = inject(MatDialogRef<GameDialog>)
  private readonly data = inject<IGameDialogPassedData>(MAT_DIALOG_DATA)
  private readonly steamService: SteamService = inject(SteamService)

  @ViewChild('details', { static: true }) protected detailsRef: ElementRef

  protected gameDetails: IGameDialogInfo
  private _loading: WritableSignal<boolean> = signal(true)

  protected get loading () {
    return this._loading()
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
                achievements: this.steamService.isSuccessfulResponse(userAchievements) === true ? this.steamService.mapUserAchievements(gameSchema, userAchievements) : []
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
