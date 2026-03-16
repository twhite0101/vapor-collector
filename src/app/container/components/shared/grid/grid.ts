import { formatNumber } from '@angular/common'
import type { OnChanges, SimpleChanges, WritableSignal } from '@angular/core'
import { Component, computed, Input, signal } from '@angular/core'
import { MatInput } from '@angular/material/input'
import { AgGridAngular } from 'ag-grid-angular'
import type { ColDef, GetRowIdFunc, GetRowIdParams, GridApi, GridReadyEvent, RowSelectionOptions, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy } from 'ag-grid-community'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'

@Component({
  selector: 'app-grid',
  imports: [
    AgGridAngular,
    MatInput
  ],
  templateUrl: './grid.html',
  styleUrl: './grid.scss'
})
export class Grid implements OnChanges {
  @Input({ required: true }) public parentData: unknown[]
  @Input({ required: true }) public parentColDefs: ColDef[]

  @Input() public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: false
  }

  @Input() public autoSizeStrat: SizeColumnsToFitGridStrategy | SizeColumnsToFitProvidedWidthStrategy | SizeColumnsToContentStrategy = {
    type: 'fitCellContents'
  }

  @Input() public rowSelectionOptions: RowSelectionOptions = {
    mode: 'multiRow',
    enableClickSelection: true,
    checkboxes: false,
    headerCheckbox: false
  }

  @Input() public domLayout: 'normal' | 'autoHeight' | 'print' = 'normal'

  @Input({ required: true }) public parentGridType: 'Games' | 'Achievements' | 'Wishlist'

  @Input() public parentStyle: string

  protected myGridData: unknown[] | undefined = []
  protected myColDefs: ColDef[] = []
  protected myDefaultColDef: ColDef = this.defaultColDef
  protected myGridType = ''
  protected mySizeStrat: SizeColumnsToFitGridStrategy | SizeColumnsToFitProvidedWidthStrategy | SizeColumnsToContentStrategy
  private _myGridStyle: WritableSignal<string> = signal('')
  protected isNoRowsHidden = true

  protected isStatusBarActive = true

  protected get myGridStyle () {
    return this._myGridStyle()
  }

  private gridLengthStatus = signal(0)
  private filteredCount = signal(0)

  private _status = computed(() => {
    let status: string

    if (this.gridLengthStatus() === 0) {
      return ''
    }
    else {
      status = this.myGridData !== undefined ? `Total ${this.myGridType}: ${formatNumber(this.myGridData.length, 'en-US')}` : `Total ${this.myGridType}: 0`
    }

    if (this.filteredCount() > 0) {
      status += `   Filtered: ${formatNumber(this.filteredCount(), 'en-US')}`
    }

    return status
  })

  protected get status () {
    return this._status()
  }

  private gridApi: GridApi

  public constructor () {
    ModuleRegistry.registerModules([AllCommunityModule])
  }

  public ngOnChanges (changes: SimpleChanges): void {
    Object.entries(changes).forEach(change => {
      if (this.gridApi) {
        this.resetGrid()
      }

      switch (change[0]) {
        case 'parentData':
          if (!this.parentData) {
            this.myGridData = undefined
            this.isNoRowsHidden = true
          }
          else {
            this.isNoRowsHidden = false
            this.myGridData = this.parentData
            this.gridLengthStatus.set(this.myGridData.length)
            this.gridApi?.setGridOption('rowData', this.myGridData)
          }
          break
        case 'parentColDefs':
          this.myColDefs = this.parentColDefs
          break
        case 'parentGridType':
          this.myGridType = this.parentGridType
          break
        case 'autoSizeStrat':
          this.mySizeStrat = this.autoSizeStrat
          break
        case 'parentStyle':
          if (!this.parentStyle) {
            this._myGridStyle.set('height: 32vh')
          }
          else {
            this._myGridStyle.set(this.parentStyle)
          }
          break
        default:
          throw Error(`Unhandled change event type: "${change[0]}"`)
      }
    })
  }

  protected onFilterInputChange = () => {
    this.gridApi.setGridOption('quickFilterText', (document.getElementById('filter-input') as HTMLInputElement).value)
  }

  protected getRowId: GetRowIdFunc = (params: GetRowIdParams<any>) => {
    if (params.data.id && typeof params.data.id === 'string') {
      return params.data.id
    }
    else {
      throw Error('Input gridData is missing a string property named "id"')
    }
  }

  protected onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api
  }

  protected onFilterChanged = () => {
    this.filteredCount.set(this.gridApi.getDisplayedRowCount())
  }

  private getFilteredRow = (): unknown[] => {
    const filteredRows: unknown[] = []

    this.gridApi.forEachNodeAfterFilter(row => {
      filteredRows.push(row.data)
    })

    return filteredRows
  }

  private resetGrid = () => {
    this.gridApi.deselectAll()

    if (this.gridApi.isAnyFilterPresent()) {
      this.gridApi.setFilterModel(null)
    }

    this.gridApi.autoSizeAllColumns()
  }
}
