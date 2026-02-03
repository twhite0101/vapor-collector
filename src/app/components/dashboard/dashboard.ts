import { ScrollingModule } from '@angular/cdk/scrolling'
import { NgOptimizedImage } from '@angular/common'
import type { OnInit, WritableSignal } from '@angular/core'
import { Component, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import type { FormControl } from '@angular/forms'
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import type { IUser, IUserGameInfo, IUserGamesLibraryResponse } from '../../models/Steam'
import { AuthService } from '../../services/auth/auth-service'
import { SteamService } from '../../services/steam/data/steam-service'

@Component({
  selector: 'app-dashboard',
  imports: [
    MatExpansionModule,
    MatCardModule,
    NgOptimizedImage,
    ScrollingModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  // Dependency Injections
  protected readonly authService: AuthService = inject(AuthService)
  private readonly steamService: SteamService = inject(SteamService)
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)

  protected user: IUser | null
  protected name: string
  protected library: IUserGamesLibraryResponse
  protected filteredLibrary: IUserGameInfo[] = []

  protected filterLibraryControl: FormControl<string> = this.fb.control<string>('')

  private _hasUser: WritableSignal<boolean> = signal(false)
  private _hasLibrary: WritableSignal<boolean> = signal(false)

  public constructor () {
    this.filterLibraryControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.filteredLibrary = this.filterGames(value)
      })
  }

  public ngOnInit (): void {
    if (!this.authService.user) {
      this.requestUser()
    }
    else {
      this.user = this.authService.user
      this.getGames()
      this._hasUser.set(true)
    }
  }

  protected logOutClicked = () => {
    this._hasUser.set(false)
    this._hasLibrary.set(false)
    this.authService.logout()
  }

  private requestUser = async () => {
    const requestedUser = await this.authService.retrieveUser()
    if (requestedUser) {
      this.authService.setUser(requestedUser.user)
      if (this.authService.user) {
        this.user = this.authService.user
        this.getGames()
        this._hasUser.set(true)
      }
    }
  }

  protected get hasUser () {
    return this._hasUser()
  }

  protected get hasLibrary () {
    return this._hasLibrary()
  }

  private getGames = async () => {
    const response = await this.steamService.getOwnedGames()
    if (response) {
      this.library = response
      this.filteredLibrary.push(...this.library.games)
      this._hasLibrary.set(true)
    }
  }

  protected calculateHoursPlayed = (minutesPlayed: number): number => {
    if (minutesPlayed === 0) {
      return 0
    }

    return minutesPlayed / 60
  }

  protected filterGames = (value: string): IUserGameInfo[] => {
    const filterValue = value.toLowerCase()

    if (value?.length) {
      return this.library.games.filter(game => game.name.toLowerCase().includes(filterValue))
    }

    return this.library.games
  }
}
