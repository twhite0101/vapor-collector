import { isPlatformBrowser } from '@angular/common'
import { inject, Injectable, PLATFORM_ID } from '@angular/core'
import type { IUser } from '../../models/Steam'

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly isBrowser: boolean

  public constructor () {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  }

  public setItem = (key: string, value: IUser) => { // type will be a union as more types are incorporated
    if (this.isBrowser) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  public getItem = (key: string): IUser | null => { // type will be a union as more types are incorporated
    if (this.isBrowser) {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    }
    return null
  }

  public removeItem = (key: string) => {
    if (this.isBrowser) {
      localStorage.removeItem(key)
    }
  }
}
