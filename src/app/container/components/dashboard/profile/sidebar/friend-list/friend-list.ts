import { ScrollingModule } from '@angular/cdk/scrolling'
import { NgOptimizedImage } from '@angular/common'
import type { OnInit, WritableSignal } from '@angular/core'
import { Component, effect, inject, Input, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import type { FormControl } from '@angular/forms'
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import type { ISteamFriend, IUser } from '../../../../../../models/Steam'
import { AuthService } from '../../../../../../services/auth/auth-service'
import { StateService } from '../../../../../../services/state/state-service'
import { FriendDialog } from '../../../../shared/friend-dialog/friend-dialog'

@Component({
  selector: 'app-friends-list',
  imports: [
    MatExpansionModule,
    MatCardModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    ScrollingModule,
    NgOptimizedImage,
    MatButtonModule
  ],
  templateUrl: './friend-list.html',
  styleUrl: './friend-list.scss'
})
export class FriendList implements OnInit {
  // Dependency Injections
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private readonly state: StateService = inject(StateService)
  private readonly dialog: MatDialog = inject(MatDialog)
  protected readonly authService: AuthService = inject(AuthService)

  @Input({ required: true }) public user: IUser

  protected _allFriends: ISteamFriend[] = []
  protected onlineFriends: ISteamFriend[] = []
  protected filteredFriends: ISteamFriend[] = []

  protected filterFriendListControl: FormControl<string> = this.fb.control<string>('')

  protected _showNoFriends: WritableSignal<boolean> = signal(false)
  protected friendListLength: WritableSignal<number> = signal(0)

  public constructor () {
    this.filterFriendListControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.filteredFriends = this.filterFriends(value)
        this.friendListLength.set(this.filteredFriends.length)
      })
    effect(() => {
      if (this.friendListLength() === 0) {
        this._showNoFriends.set(true)
      }
      else {
        this._showNoFriends.set(false)
      }
    })
  }

  public ngOnInit (): void {
    this._allFriends = this.user.friendList
    this.onlineFriends = this._allFriends.filter(friend => friend.personaState === 1 || friend.personaState === 2 || friend.personaState === 3 || friend.personaState === 4)
    this.filteredFriends.push(...this.onlineFriends)
    this.friendListLength.set(this.filteredFriends.length)
    this.state.setFriendListStatus(true)
  }

  protected filterFriends = (value: string): ISteamFriend[] => {
    const filterValue = value.toLowerCase()

    if (value?.length) {
      return this.onlineFriends.filter(friend => friend.displayName.toLowerCase().includes(filterValue))
    }

    return this.onlineFriends
  }

  protected get showNoFriends () {
    return this._showNoFriends()
  }

  protected openGameDialog = (friend: ISteamFriend) => {
    const dialogConfig = new MatDialogConfig()
    const friendUser = this.authService.mapSteamFriendToUser(friend)
    const recentlyPlayedGames = friendUser.gameLibrary.filter(game => game.playtime2Weeks > 0)
    dialogConfig.data = {
      friend: friend,
      user: this.user,
      friendUser: friendUser,
      recentlyPlayedGames: recentlyPlayedGames,
      recentPlayTime: this.authService.calculateRecentPlayTime(recentlyPlayedGames)
    }
    dialogConfig.panelClass = 'friend-dialog'
    this.dialog.open(FriendDialog, dialogConfig)
  }
}
