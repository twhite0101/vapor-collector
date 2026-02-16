import type { WritableSignal } from '@angular/core'
import { computed, Injectable, signal } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private _isHeaderReady: WritableSignal<boolean> = signal(false)
  public setHeaderStatus = (status: boolean) => {
    this._isHeaderReady.set(status)
  }

  private _isNamePlateReady: WritableSignal<boolean> = signal(false)
  public setNamePlateStatus = (status: boolean) => {
    this._isNamePlateReady.set(status)
  }

  private _isFriendListReady: WritableSignal<boolean> = signal(false)
  public setFriendListStatus = (status: boolean) => {
    this._isFriendListReady.set(status)
  }

  private _isRecentGamesReady: WritableSignal<boolean> = signal(false)
  public setRecentGamesStatus = (status: boolean) => {
    this._isRecentGamesReady.set(status)
  }

  private _isDashboardReady = computed(() => {
    if (this._isNamePlateReady() === false) {
      return false
    }
    else if (this._isFriendListReady() === false) {
      return false
    }
    else if (this._isRecentGamesReady() === false) {
      return false
    }
    else {
      return true
    }
  })

  private _isLogInFinished = computed(() => {
    if (this._isDashboardReady() === false) {
      return false
    }
    else if (this._isHeaderReady() === false) {
      return false
    }
    else {
      return true
    }
  })

  public get isLoginFinished () {
    return this._isLogInFinished()
  }

  public userLoggedOut = () => {
    this._isHeaderReady.set(false)
    this._isNamePlateReady.set(false)
    this._isFriendListReady.set(false)
    this._isRecentGamesReady.set(false)
  }
}
