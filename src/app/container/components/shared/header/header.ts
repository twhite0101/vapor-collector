import { NgOptimizedImage } from '@angular/common'
import type { OnInit } from '@angular/core'
import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import type { IUser } from '../../../../models/Steam'
import { StateService } from '../../../../services/state/state-service'
import { UserService } from '../../../../services/user/user-service'
import { WishlistDialog } from '../wishlist-dialog/wishlist-dialog'

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    NgOptimizedImage
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  // Dependency Injections
  protected readonly userService: UserService = inject(UserService)
  private readonly state: StateService = inject(StateService)
  private readonly dialog: MatDialog = inject(MatDialog)

  protected user: IUser | null
  protected name: string

  public ngOnInit (): void {
    if (this.userService.hasUser) {
      this.user = this.userService.user
    }
    this.state.setHeaderStatus(true)
  }

  protected loginClicked = () => {
    this.userService.login()
  }

  protected logOutClicked = () => {
    this.userService.logout()
  }

  protected openWishlistDialog = () => {
    const dialogConfig = new MatDialogConfig()
    dialogConfig.data = {
      user: this.user,
      style: '55vh'
    }
    dialogConfig.panelClass = 'wishlist-dialog'
    this.dialog.open(WishlistDialog, dialogConfig)
  }
}
