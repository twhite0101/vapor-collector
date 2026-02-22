import { ScrollingModule } from '@angular/cdk/scrolling'
import { NgOptimizedImage } from '@angular/common'
import type { OnInit } from '@angular/core'
import { Component, inject, Input } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import type { FormControl } from '@angular/forms'
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import type { IUser, IUserGameInfo } from '../../../../models/Steam'
import { GameDialog } from '../game-dialog/game-dialog'

@Component({
  selector: 'app-game-library',
  imports: [
    MatExpansionModule,
    MatCardModule,
    ScrollingModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    NgOptimizedImage
  ],
  templateUrl: './game-library.html',
  styleUrl: './game-library.scss'
})
export class GameLibrary implements OnInit {
  // Dependency Injections
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private readonly dialog: MatDialog = inject(MatDialog)

  @Input({ required: true }) public user: IUser

  protected _allGames: IUserGameInfo[]
  protected filteredLibrary: IUserGameInfo[] = []

  protected filterLibraryControl: FormControl<string> = this.fb.control<string>('')

  public constructor () {
    this.filterLibraryControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.filteredLibrary = this.filterGames(value)
      })
  }

  public ngOnInit (): void {
    this._allGames = this.user.gameLibrary
    this.filteredLibrary.push(...this._allGames)
  }

  protected openGameDialog = (game: IUserGameInfo) => {
    const dialogConfig = new MatDialogConfig()
    dialogConfig.data = {
      game: game,
      user: this.user
    }
    dialogConfig.panelClass = 'game-dialog'
    this.dialog.open(GameDialog, dialogConfig)
  }

  protected filterGames = (value: string): IUserGameInfo[] => {
    const filterValue = value.toLowerCase()

    if (value?.length) {
      return this._allGames.filter(game => game.name.toLowerCase().includes(filterValue))
    }

    return this._allGames
  }
}
