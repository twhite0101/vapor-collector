import { NgClass } from '@angular/common'
import type { OnInit, WritableSignal } from '@angular/core'
import { Component, Input, signal } from '@angular/core'
import type { IUser } from '../../../../../models/Steam'
import { GameLibrary } from '../../../shared/game-library/game-library'
import { FriendList } from './friend-list/friend-list'

@Component({
  selector: 'app-sidebar',
  imports: [
    FriendList,
    NgClass,
    GameLibrary
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {
  @Input({ required: true }) public user: IUser

  private _showCurrentGame: WritableSignal<boolean> = signal(false)

  protected get showCurrentGame () {
    return this._showCurrentGame()
  }

  protected currentGame: string
  protected statusClass: string

  public ngOnInit (): void {
    if (this.user.personaState === 1 && this.user.currentGameName && this.user.currentGameName !== '') {
      this.currentGame = this.user.currentGameName
      this._showCurrentGame.set(true)
    }
    this.statusClass = `${this.user.status.toLowerCase().replaceAll(' ', '-')}-text`
  }
}
