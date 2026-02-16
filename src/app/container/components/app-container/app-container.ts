import { Component, effect, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { LoadingService } from '../../../services/loading/loading-service'
import { StateService } from '../../../services/state/state-service'
import { Header } from '../shared/header/header'

@Component({
  selector: 'app-app-container',
  imports: [
    RouterOutlet,
    Header
  ],
  templateUrl: './app-container.html',
  styleUrl: './app-container.scss'
})
export class AppContainer {
  // Dependency Injection
  private readonly state: StateService = inject(StateService)
  private readonly loadingService: LoadingService = inject(LoadingService)

  public constructor () {
    effect(() => {
      if (this.state.isLoginFinished) {
        this.loadingService.loadingOff()
      }
    })
  }
}
