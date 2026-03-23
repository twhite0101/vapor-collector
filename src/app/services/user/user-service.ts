import { HttpClient } from '@angular/common/http'
import type { WritableSignal } from '@angular/core'
import { DestroyRef, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router'
import type { Observable } from 'rxjs'
import { firstValueFrom, forkJoin } from 'rxjs'
import type { IFriendListFullResponse, IGetBadgesFullResponse, ILoginResponse, ISteamFriend, IUser, IUserAdditionalDetailsResponse, IUserFullResponse, IUserGamesLibraryResponse } from '../../models/Steam'
import { LoadingService } from '../loading/loading-service'
import { MappingService } from '../mapping/mapping-service'
import { StateService } from '../state/state-service'
import { SteamService } from '../steam/data/steam-service'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)
  private readonly steamService: SteamService = inject(SteamService)
  private readonly loadingService: LoadingService = inject(LoadingService)
  private readonly state: StateService = inject(StateService)
  private readonly router: Router = inject(Router)
  private destroyRef = inject(DestroyRef)
  private readonly mappingService: MappingService = inject(MappingService)

  private readonly LOGGED_KEY = 'isLoggedIn'

  private _user: WritableSignal<IUser | null> = signal(null)
  private _isLoggedIn: WritableSignal<boolean> = signal(false)

  private _hasUser: WritableSignal<boolean> = signal(false)
  private _hasBadges: WritableSignal<boolean> = signal(false)

  private _hasLibrary: WritableSignal<boolean> = signal(false)

  private apiUrl = 'http://localhost:3000'

  public login = () => {
    window.location.href = this.apiUrl + '/auth/steam'
  }

  public logout = () => {
    this._user.set(null)
    this._hasUser.set(false)
    this._hasLibrary.set(false)
    this._hasUser.set(false)
    this.state.userLoggedOut()
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

  public retrieveUser = async (): Promise<ILoginResponse> => {
    const response = await firstValueFrom(this.http.get<ILoginResponse>(this.apiUrl + '/auth/user', { withCredentials: true }))
    return response
  }

  public getUserAdditionalDetails = async (id: string) => {
    const response = await firstValueFrom(this.http.get<IUserAdditionalDetailsResponse[]>(this.apiUrl + `/user/getAdditionalUserDetails?steamIds=${id}`, { withCredentials: true }))
    return response
  }

  public initializeUserDetails = async () => {
    const user = await this.retrieveUser()

    const userAdditionalDetails = await this.getUserAdditionalDetails(user.response._json.steamid)

    const wishlist = await this.steamService.initializeWishlist(user.response._json.steamid)

    const profileItems = await this.steamService.getProfileItems()

    const userFull: IUserFullResponse = {
      user: user.response,
      additionalDetails: userAdditionalDetails,
      wishlist: wishlist,
      profileItems: profileItems
    }
    return userFull
  }

  public getUserInfo = (): Observable<[IUserFullResponse, IUserGamesLibraryResponse, IGetBadgesFullResponse, IFriendListFullResponse]> => {
    // Get user info
    const user = this.initializeUserDetails()

    // Get user's game library
    const library = this.steamService.initializeGameLibrary()

    // Get user's badge and account level info
    const badges = this.steamService.getUserBadges()

    // Get user's friend list
    const friendList = this.steamService.initializeFriendList()

    // Return array of observables of requests as a fork join
    return forkJoin([user, library, badges, friendList])
  }

  public initializeUser = () => {
    this.loadingService.loadingOn()
    this.getUserInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([user, library, badges, friendList]) => {
          const returnedData = this.mappingService.mapAuthResponseToUser(user, library, badges, friendList)
          returnedData.accountValues = this.mappingService.calculateAccountValueDetails(returnedData.gameLibrary);
          (returnedData.friendList as ISteamFriend[]).forEach(friend => friend.accountValues = friend.gameLibrary.length > 0 ? this.mappingService.calculateAccountValueDetails(friend.gameLibrary) : this.steamService.createNewAccountValueDetails())
          this.mappingService.calculateAccountRankings(returnedData)
          this._user.set(returnedData)
          this._hasUser.set(true)
          this._hasLibrary.set(true)
          this._hasBadges.set(true)
          this.router.navigate(['/home/dashboard'])
        },
        error: (err) => {
          this._user.set(null)
          console.error(err)
        }
      })
  }

  public setUser = (user: IUser | null) => {
    if (user) {
      this._user.set(user as IUser)
      this._hasUser.set(true)
    }
    else {
      this._user.set(null)
      this._hasUser.set(false)
    }
  }

  public get user () {
    return this._user()
  }

  public setHasUser = (value: boolean) => {
    this._hasUser.set(value)
  }

  public setHasLibrary = (value: boolean) => {
    this._hasLibrary.set(value)
  }

  public setHasBadges = (value: boolean) => {
    this._hasBadges.set(value)
  }

  public get hasUser () {
    return this._hasUser()
  }

  public get hasLibrary () {
    return this._hasLibrary()
  }

  public get hasBadges () {
    return this._hasBadges()
  }

  public isAuthenticated = (): boolean => {
    return !!this.getLoggedInStatus()
  }

  public isTokenValid = (): Observable<boolean> => {
    return this.http.get<boolean>(this.apiUrl + '/auth/token-valid', { withCredentials: true })
  }
}
