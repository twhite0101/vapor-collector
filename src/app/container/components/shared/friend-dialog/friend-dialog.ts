import type { AfterViewInit, WritableSignal } from '@angular/core'
import { Component, inject, signal } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import type { MatTabChangeEvent } from '@angular/material/tabs'
import { MatTabsModule } from '@angular/material/tabs'
import type { ColDef, SizeColumnsToContentStrategy } from 'ag-grid-community'
import { CarouselModule } from 'primeng/carousel'
import { FriendGameLibraryColDef } from '../../../../models/ColdDefs'
import type { IDialogCarouselDisplayOptions } from '../../../../models/Dialog'
import type { IFriendDialogPassedData, IUserGameInfo } from '../../../../models/Steam'
import { MappingService } from '../../../../services/mapping/mapping-service'
import { SteamService } from '../../../../services/steam/data/steam-service'
import { Nameplate } from '../../dashboard/profile/nameplate/nameplate'
import { RecentGames } from '../../dashboard/profile/recent-games/recent-games'
import { Grid } from '../grid/grid'
import { ValueDetails } from '../value-details/value-details'

@Component({
  selector: 'app-friend-dialog',
  imports: [
    CarouselModule,
    MatProgressBarModule,
    MatTabsModule,
    Grid,
    Nameplate,
    RecentGames,
    ValueDetails
  ],
  templateUrl: './friend-dialog.html',
  styleUrl: './friend-dialog.scss'
})
export class FriendDialog implements AfterViewInit {
  // Dependency Injections
  private readonly dialogRef = inject(MatDialogRef<FriendDialog>)
  private readonly data = inject<IFriendDialogPassedData>(MAT_DIALOG_DATA)
  private readonly steamService: SteamService = inject(SteamService)
  private readonly mappingService: MappingService = inject(MappingService)

  protected friendDetails: IFriendDialogPassedData
  private _loading: WritableSignal<boolean> = signal(true)
  protected libraryColDefs: ColDef<IUserGameInfo>[] = FriendGameLibraryColDef

  protected isLibraryActive = false

  protected friendLibrarySizeStrat: SizeColumnsToContentStrategy = {
    type: 'fitCellContents',
    columnLimits: [
      {
        colId: 'appId',
        maxWidth: 183
      }
    ]
  }

  // Recent Games Display Options
  protected recentGamesDisplayOptions: IDialogCarouselDisplayOptions = {
    numVisible: 1,
    numScroll: 1
  }

  protected get loading () {
    return this._loading()
  }

  public ngAfterViewInit (): void {
    this.dialogRef.afterOpened()
      .subscribe(async () => {
        this.friendDetails = {
          user: this.data.user,
          friend: this.data.friend,
          friendUser: this.data.friendUser,
          recentlyPlayedGames: this.data.recentlyPlayedGames,
          recentPlayTime: this.data.recentPlayTime
        }
        this.friendDetails.friend.gameLibrary.forEach(game => game.id = game.appId.toString())
        if (!this.friendDetails.friend.badges) {
          await this.steamService.getUserBadges(this.friendDetails.friend.steamId)
            .then(response => {
              this.friendDetails.friend.badges = this.mappingService.mapBadgesResponse(response.badges.badges)
              this.friendDetails.friend.playerLevel = {
                playerXp: response.badges.player_xp,
                playerLevel: response.badges.player_level,
                playerXpNeededToLevelUp: response.badges.player_xp_needed_to_level_up,
                playerXpNeededCurrentLevel: response.badges.player_xp_needed_current_level,
                levelPercentile: Math.ceil(response.levelPercentile.player_level_percentile * 100 ) / 100
              }
            })
        }
        this._loading.set(false)
      })
  }

  protected onTabChange = (event: MatTabChangeEvent) => {
    this.isLibraryActive = event.index === 2 ? true : false
  }
}
