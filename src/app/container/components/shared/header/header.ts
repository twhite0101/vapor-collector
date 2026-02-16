import { ScrollingModule } from '@angular/cdk/scrolling'
import { NgOptimizedImage } from '@angular/common'
import type { OnInit } from '@angular/core'
import { Component, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import type { FormControl } from '@angular/forms'
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import type { IUser, IUserGameInfo } from '../../../../models/Steam'
import { AuthService } from '../../../../services/auth/auth-service'
import { StateService } from '../../../../services/state/state-service'

@Component({
  selector: 'app-header',
  imports: [
    MatExpansionModule,
    MatCardModule,
    ScrollingModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    NgOptimizedImage
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  // Dependency Injections
  protected readonly authService: AuthService = inject(AuthService)
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private readonly state: StateService = inject(StateService)

  protected user: IUser | null
  protected name: string
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
    if (this.authService.hasUser) {
      this.user = this.authService.user
      if (this.user) {
        this.filteredLibrary.push(...this.user.gameLibrary)
      }
    }
    this.state.setHeaderStatus(true)
  }

  protected loginClicked = () => {
    this.authService.login()
  }

  protected logOutClicked = () => {
    this.authService.logout()
  }

  protected filterGames = (value: string): IUserGameInfo[] => {
    const filterValue = value.toLowerCase()

    if (value?.length) {
      return (this.user as IUser).gameLibrary.filter(game => game.name.toLowerCase().includes(filterValue))
    }

    return (this.user as IUser).gameLibrary
  }
}
