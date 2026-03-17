import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  public separateArrayIntoChunks = (appIds: number[], chunkSize: number): number[][] => {
    const multipleAppIdArrays: number[][] = []

    for (let i = 0; i < appIds.length; i += chunkSize) {
      multipleAppIdArrays.push(appIds.slice(i, i + chunkSize))
    }

    return multipleAppIdArrays
  }

  public formatHourValues = (value: number): number => {
    return isNaN(value) ? 0 : Math.round(((value / 60) + Number.EPSILON) * 100) / 100
  }

  public formatFriendPlayTime = (time: number): number => {
    return time !== undefined ? Number((time / 60).toFixed(1)) : 0
  }

  public convertUnixTimeToCurrentTime = (unix: number): string => {
    return new Date(unix * 1000).toISOString().slice(0, new Date(unix * 1000).toISOString().indexOf('T'))
  }

  public formatMonetaryAmount = (value: number): string => {
    return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  public isSuccessfulResponse = (response: any): boolean => {
    if (response.status) {
      return false
    }
    else {
      return true
    }
  }
}
