import type { ColDef } from 'ag-grid-community'
import { GameImgCellRenderer } from '../container/components/shared/grid/game-img-cell-renderer/game-img-cell-renderer'
import type { IUserGameInfo } from './Steam'

export const FriendGameLibraryColDef: ColDef<IUserGameInfo>[] = [
  {
    headerName: 'See Details',
    field: 'appId',
    editable: false,
    filter: false,
    pinned: 'left',
    sortable: false,
    resizable: false,
    suppressMovable: true,
    autoHeight: true,
    cellStyle: { 'padding-left': '0px', 'padding-right': '0px' },
    cellRenderer: GameImgCellRenderer
  },
  {
    headerName: 'Name',
    field: 'name',
    editable: false,
    filter: true,
    sortable: true,
    resizable: true,
    suppressMovable: true
  },
  {
    headerName: 'Total Playtime',
    field: 'playtimeForever',
    editable: false,
    filter: true,
    sortable: true,
    resizable: true,
    suppressMovable: true
  },
  {
    headerName: 'Recent Playtime',
    field: 'playtime2Weeks',
    editable: false,
    filter: true,
    sortable: true,
    resizable: true,
    suppressMovable: true
  },
  {
    headerName: 'Steam Deck Playtime',
    field: 'playtimeDeckForever',
    editable: false,
    filter: true,
    sortable: true,
    resizable: true,
    suppressMovable: true
  },
  {
    headerName: 'Disconnected Playtime',
    field: 'playtimeDisconnected',
    editable: false,
    filter: true,
    sortable: true,
    resizable: true,
    suppressMovable: true
  },
  {
    headerName: 'Windows Playtime',
    field: 'playtimeWindowsForever',
    editable: false,
    filter: true,
    sortable: true,
    resizable: true,
    suppressMovable: true
  },
  {
    headerName: 'Linux Playtime',
    field: 'playtimeLinuxForever',
    editable: false,
    filter: true,
    sortable: true,
    resizable: true,
    suppressMovable: true
  },
  {
    headerName: 'Mac Playtime',
    field: 'playtimeMacForever',
    editable: false,
    filter: true,
    sortable: true,
    resizable: true,
    suppressMovable: true
  },
  {
    headerName: 'Current Version',
    field: 'gameVersion',
    editable: false,
    filter: true,
    sortable: true,
    resizable: true,
    suppressMovable: true
  }
]
