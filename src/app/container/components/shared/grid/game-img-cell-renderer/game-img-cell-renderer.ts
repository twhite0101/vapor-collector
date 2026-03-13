import { NgOptimizedImage } from '@angular/common'
import { Component } from '@angular/core'
import type { ICellRendererAngularComp } from 'ag-grid-angular'
import type { ICellRendererParams } from 'ag-grid-community'
import { ImageFallback } from '../../../../../directives/image-fallback/image-fallback'
import type { IUserGameInfo } from '../../../../../models/Steam'

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
  protected gameData: IUserGameInfo

  public agInit (params: ICellRendererParams<IUserGameInfo>): void {
    if (params.data) {
      this.gameData = params.data
    }
  }

  public refresh (params: ICellRendererParams<IUserGameInfo>): boolean {
    if (params.data) {
      this.gameData = params.data
    }
    return false
  }
}
