import type { AfterViewInit, WritableSignal } from '@angular/core'
import { Component, inject, signal } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import type { MatTabChangeEvent } from '@angular/material/tabs'
import { MatTabsModule } from '@angular/material/tabs'
import type { ColDef, SizeColumnsToContentStrategy } from 'ag-grid-community'
import { CarouselModule } from 'primeng/carousel'
import { FriendGameLibraryColDef } from '../../../../models/ColdDefs'
import type { IFriendDialogPassedData, IUserGameInfo } from '../../../../models/Steam'
import { AuthService } from '../../../../services/auth/auth-service'
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
  protected readonly authService: AuthService = inject(AuthService)

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

  protected get loading () {
    return this._loading()
  }

  public ngAfterViewInit (): void {
    this.dialogRef.afterOpened()
      .subscribe(() => {
        this.friendDetails = {
          user: this.data.user,
          friend: this.data.friend,
          friendUser: this.data.friendUser,
          recentlyPlayedGames: this.data.recentlyPlayedGames,
          recentPlayTime: this.data.recentPlayTime
        }
        this.friendDetails.friend.gameLibrary.forEach(game => game.id = game.appId.toString())
        this._loading.set(false)
      })
  }

  protected onTabChange = (event: MatTabChangeEvent) => {
    this.isLibraryActive = event.index === 2 ? true : false
  }
}
