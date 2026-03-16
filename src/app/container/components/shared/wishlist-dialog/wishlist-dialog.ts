import type { AfterViewInit, WritableSignal } from '@angular/core'
import { Component, inject, signal } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import type { ColDef, SizeColumnsToContentStrategy } from 'ag-grid-community'
import { WishlistColDef } from '../../../../models/ColdDefs'
import type { IUser, IWishlist, IWishlistDialogPassedData } from '../../../../models/Steam'
import { Grid } from '../grid/grid'

@Component({
  selector: 'app-wishlist',
  imports: [
    Grid,
    MatProgressBarModule
  ],
  templateUrl: './wishlist-dialog.html',
  styleUrl: './wishlist-dialog.scss'
})
export class WishlistDialog implements AfterViewInit {
  // Dependency Injections
  private readonly dialogRef = inject(MatDialogRef<WishlistDialog>)
  private readonly data = inject<IWishlistDialogPassedData>(MAT_DIALOG_DATA)

  protected user: IUser
  protected wishlistColDefs: ColDef<IWishlist>[] = WishlistColDef
  protected wishlistData: IWishlist[] = []
  protected gridStyle: string

  private _loading: WritableSignal<boolean> = signal(true)

  protected get loading () {
    return this._loading()
  }

  protected wishlistSizeStrat: SizeColumnsToContentStrategy = {
    type: 'fitCellContents',
    columnLimits: [
      {
        colId: 'appId',
        maxWidth: 183
      }
    ]
  }

  public ngAfterViewInit (): void {
    this.dialogRef.afterOpened()
      .subscribe(() => {
        this.user = this.data.user
        this.user.wishlist.forEach(game => game.id = game.appId.toString())
        this.wishlistData = [...this.data.user.wishlist]
        this.gridStyle = this.data.style
        this._loading.set(false)
      })
  }
}
