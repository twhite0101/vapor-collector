import { DatePipe, NgOptimizedImage } from '@angular/common'
import type { AfterViewInit, ElementRef, OnDestroy, OnInit } from '@angular/core'
import { booleanAttribute, ChangeDetectorRef, Component, Directive, inject, Input, ViewChild } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import type { Carousel, CarouselResponsiveOptions } from 'primeng/carousel'
import { CarouselModule } from 'primeng/carousel'
import { ImageFallback } from '../../../../../directives/image-fallback/image-fallback'
import type { IUser, IUserGameInfo } from '../../../../../models/Steam'
import { StateService } from '../../../../../services/state/state-service'
import { GameDialog } from '../../../shared/game-dialog/game-dialog'

@Directive({
  standalone: true
})
export class CarouselResizeDirective {
  protected numVisible = 3
  protected numScroll = 1
  private resizeObserver!: ResizeObserver

  private updateCarouselConfig (containerWidth: number): void {
    if (containerWidth < 950) {
      this.numVisible = 1
      this.numScroll = 1
    }
    else if (containerWidth < 1500) {
      this.numVisible = 2
      this.numScroll = 2
    }
    else {
      this.numVisible = 3
      this.numScroll = 3
    }
  }
}

@Component({
  selector: 'app-recent-games',
  imports: [
    MatCardModule,
    NgOptimizedImage,
    ImageFallback,
    DatePipe,
    CarouselModule
  ],
  templateUrl: './recent-games.html',
  styleUrl: './recent-games.scss'
})
export class RecentGames implements OnInit, AfterViewInit, OnDestroy {
  //Dependency Injections
  private readonly state: StateService = inject(StateService)
  private readonly dialog: MatDialog = inject(MatDialog)
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef)

  @Input({ required: true }) public recentlyPlayedGames: IUserGameInfo[]
  @Input({ required: true }) public user: IUser
  @Input({ required: true }) public recentPlayTime: number
  @Input({ transform: booleanAttribute }) public isFriend = false

  @ViewChild('recentGamesCarousel', { static: false }) public carousel: Carousel | undefined
  @ViewChild('recentGamesCont', { static: false }) public carouselCont: ElementRef | undefined

  protected responsiveOptions: CarouselResponsiveOptions[] = []

  protected library: IUserGameInfo[] = []
  protected numVisible = 3
  protected numScroll = 1
  private resizeObserver!: ResizeObserver

  public ngOnInit (): void {
    this.library = this.user.gameLibrary
    this.state.setRecentGamesStatus(true)
  }

  public ngAfterViewInit (): void {
    if (this.carousel && this.carouselCont) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateCarouselConfig()
      })
      this.resizeObserver.observe(this.carouselCont.nativeElement)
      this.updateCarouselConfig()
    }
  }

  public ngOnDestroy (): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  }

  private updateCarouselConfig (): void {
    if (!this.carousel || !this.carouselCont) {
      return
    }

    const containerWidth = this.carouselCont.nativeElement.clientWidth

    if (containerWidth < 950) {
      this.numVisible = 1
      this.numScroll = 1
    }
    else if (containerWidth < 1500) {
      this.numVisible = 2
      this.numScroll = 2
    }
    else {
      this.numVisible = 3
      this.numScroll = 3
    }

    this.carousel.numVisible = this.numVisible
    this.carousel.numScroll = this.numScroll
    this.cdr.detectChanges()
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
}
