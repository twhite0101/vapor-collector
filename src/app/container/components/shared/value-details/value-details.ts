import type { OnChanges, SimpleChanges } from '@angular/core'
import { booleanAttribute, Component, inject, Input } from '@angular/core'
import type { IChartData, IUser } from '../../../../models/Steam'
import { MappingService } from '../../../../services/mapping/mapping-service'
import { DonutChart } from '../donut-chart/donut-chart'

@Component({
  selector: 'app-value-details',
  imports: [
    DonutChart
  ],
  templateUrl: './value-details.html',
  styleUrl: './value-details.scss'
})
export class ValueDetails implements OnChanges {
  // Dependency Injections
  private readonly mappingService: MappingService = inject(MappingService)
  @Input({ required: true }) public user: IUser
  @Input({ required: true, transform: booleanAttribute }) public isAuthUser: boolean

  protected topValueGames: IChartData[]
  private gamesByVPH: IChartData[]

  public ngOnChanges (changes: SimpleChanges): void {
    Object.entries(changes).forEach(change => {
      switch (change[0]) {
        case 'isAuthUser':
          if (this.isAuthUser) {
            this.gamesByVPH = this.mappingService.mapMostValuableGames(this.user).sort((a, b) => a.value - b.value)
            this.topValueGames = this.gamesByVPH.filter((game, i) => {
              if (i < 4) {
                return game
              }
              else {
                return
              }
            })
          }
          break
        default:
          break
      }
    })
  }
}
