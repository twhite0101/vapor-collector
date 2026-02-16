import { AsyncPipe, NgTemplateOutlet } from '@angular/common'
import type { OnInit, TemplateRef } from '@angular/core'
import { Component, ContentChild, inject, Input } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router'
import type { Observable } from 'rxjs'
import { tap } from 'rxjs'
import { LoadingService } from '../../../../services/loading/loading-service'

@Component({
  selector: 'app-loading-spinner',
  imports: [
    MatProgressSpinnerModule,
    AsyncPipe,
    NgTemplateOutlet
  ],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss'
})
export class LoadingSpinner implements OnInit {
  // Dependency Injections
  private readonly loadingService: LoadingService = inject(LoadingService)
  private readonly router: Router = inject(Router)

  public loading$: Observable<boolean>

  @Input() public detectRouteTransition = false

  @ContentChild('loading')
  public customLoadingIndicator: TemplateRef<any> | null = null

  public constructor () {
    this.loading$ = this.loadingService.loading$
  }

  public ngOnInit (): void {
    if (this.detectRouteTransition) {
      this.router.events
        .pipe(
          takeUntilDestroyed(),
          tap((event) => {
            if (event instanceof RouteConfigLoadStart) {
              this.loadingService.loadingOn()
            }
            else if (event instanceof RouteConfigLoadEnd) {
              this.loadingService.loadingOff()
            }
          })
        )
        .subscribe()
    }
  }
}
