import type { AfterViewInit, OnChanges, SimpleChanges } from '@angular/core'
import { Component, Input } from '@angular/core'
import { RandomColor } from 'angular-randomcolor'
import type { ChartConfiguration } from 'chart.js'
import { Chart, registerables } from 'chart.js'
import type { IChartData } from '../../../../models/Steam'

Chart.register(...registerables)

@Component({
  selector: 'app-donut-chart',
  imports: [],
  templateUrl: './donut-chart.html',
  styleUrl: './donut-chart.scss'
})
export class DonutChart implements OnChanges, AfterViewInit {
  @Input({ required: true }) public parentData: IChartData[]

  protected myChartData: IChartData[]
  protected chartConfig: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: RandomColor.generateColor()
        }
      ]
    },
    options: {
      aspectRatio: 1.25,
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Dollars Per Hour',
          font: {
            size: 12
          },
          position: 'bottom'
        },
        legend: {
          display: false
        }
      }
    }
  }
  protected myChart: Chart
  protected chartReady = false

  public ngAfterViewInit (): void {
    this.myChart = new Chart('myChart', this.chartConfig)
  }

  public ngOnChanges (changes: SimpleChanges): void {
    if (changes['parentData']?.currentValue) {
      this.chartConfig.data = {
        labels: this.parentData.map(data => data.label),
        datasets: [
          {
            data: this.parentData.map(data => data.value),
            backgroundColor: this.parentData.map(() => {
              return RandomColor.generateColor()
            })
          }
        ]
      }
      this.chartReady = true
    }
  }
}
