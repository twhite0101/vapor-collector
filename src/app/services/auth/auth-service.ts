import { HttpClient } from '@angular/common/http'
import type { WritableSignal } from '@angular/core'
import { inject, Injectable, signal } from '@angular/core'
import type { Observable } from 'rxjs'
import { firstValueFrom } from 'rxjs'
import type { IUser, IUserRequestResponse } from '../../models/Steam'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)

  private readonly LOGGED_KEY = 'isLoggedIn'

  private _user: WritableSignal<IUser | null> = signal(null)
  private _isLoggedIn: WritableSignal<boolean> = signal(false)

  private apiUrl = 'http://localhost:3000'

  public login = () => {
    window.location.href = this.apiUrl + '/auth/steam'
  }

  public logout = () => {
    window.location.href = this.apiUrl + '/logout'
  }

  public getLoggedInStatus = (): boolean | null => {
    if (typeof window !== 'undefined') {
      return this._isLoggedIn()
    }
    return null
  }

  public setLoggedInStatus = (status: string | null) => {
    const isLoggedIn = status === 'true'
    if (isLoggedIn) {
      localStorage.setItem(this.LOGGED_KEY, status)
      this._isLoggedIn.set(true)
    }
    else {
      localStorage.removeItem(this.LOGGED_KEY)
      this._isLoggedIn.set(false)
    }
  }

  public retrieveUser = async (): Promise<IUserRequestResponse> => {
    const response = await firstValueFrom(this.http.get<IUserRequestResponse>(this.apiUrl + '/auth/user', { withCredentials: true }))
    return response
  }

  public setUser = (user: IUser | null) => {
    if (user) {
      this._user.set(user as IUser)
    }
    else {
      this._user.set(null)
    }
  }

  public get user () {
    return this._user()
  }

  public isAuthenticated = (): boolean => {
    return !!this.getLoggedInStatus()
  }

  public isTokenValid = (): Observable<boolean> => {
    return this.http.get<boolean>(this.apiUrl + '/auth/token-valid', { withCredentials: true })
  }
}
