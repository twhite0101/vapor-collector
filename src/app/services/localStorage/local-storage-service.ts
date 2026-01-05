import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly isBrowser: boolean

  constructor () {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  }

  public setItem = (key: string, value: any) => {
    if (this.isBrowser) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  public getItem = (key: string): any | null => {
    if (this.isBrowser) {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    }
  }

  public removeItem = (key: string) => {
    if (this.isBrowser) {
      localStorage.removeItem(key)
    }
  }
}
