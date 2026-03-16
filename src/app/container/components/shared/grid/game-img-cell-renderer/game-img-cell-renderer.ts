import { NgOptimizedImage } from '@angular/common'
import type { WritableSignal } from '@angular/core'
import { Component, signal } from '@angular/core'
import type { ICellRendererAngularComp } from 'ag-grid-angular'
import type { ICellRendererParams } from 'ag-grid-community'
import { ImageFallback } from '../../../../../directives/image-fallback/image-fallback'
import type { IUserGameInfo, IWishlist } from '../../../../../models/Steam'

@Component({
  selector: 'app-game-img-cell-renderer',
  imports: [
    NgOptimizedImage,
    ImageFallback
  ],
  templateUrl: './game-img-cell-renderer.html',
  styleUrl: './game-img-cell-renderer.scss'
})
export class GameImgCellRenderer implements ICellRendererAngularComp {
  protected gameData: IUserGameInfo | IWishlist
  protected isWishlist = false
  private _storeUrl: WritableSignal<string> = signal('')

  protected get storeUrl () {
    return this._storeUrl()
  }

  public agInit (params: ICellRendererParams<IUserGameInfo | IWishlist>): void {
    if (!params.data) {
      console.error('No param data provided')
    }

    if (this.instanceofWishlist(params.data as IUserGameInfo | IWishlist)) {
      this.gameData = params.data as IWishlist
      this._storeUrl.set(this.gameData.storeUrl)
      this.isWishlist = true
    }
    else {
      this.gameData = params.data as IUserGameInfo
    }
  }

  public refresh (params: ICellRendererParams<IUserGameInfo | IWishlist>): boolean {
    if (!params.data) {
      console.error('No param data provided')
    }

    if (this.instanceofWishlist(params.data as IUserGameInfo | IWishlist)) {
      this.gameData = params.data as IWishlist
      this.isWishlist = true
    }
    else {
      this.gameData = params.data as IUserGameInfo
    }
    return false
  }

  private instanceofWishlist = (data: IUserGameInfo | IWishlist): data is IWishlist => {
    return 'dateAdded' in data
  }
}
