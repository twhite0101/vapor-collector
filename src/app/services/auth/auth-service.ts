import { HttpClient } from '@angular/common/http'
import type { WritableSignal } from '@angular/core'
import { DestroyRef, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router'
import type { Observable } from 'rxjs'
import { firstValueFrom, forkJoin } from 'rxjs'
import type { IBadge, IFriendListFullResponse, IGetBadgesResponse, IGetBadgesResponseArray, IGetRecentlyPlayedGamesResponse, IGetRecentlyPlayedGamesResponseInfo, ILoginResponse, ILoginResponseUser, IRecentlyPlayedGame, ISteamFriend, IUser, IUserGameInfo, IUserGameInfoResponse, IUserGamesLibraryResponse } from '../../models/Steam'
import { SteamService } from '../steam/data/steam-service'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)
  private readonly steamService: SteamService = inject(SteamService)
  private readonly router: Router = inject(Router)
  private destroyRef = inject(DestroyRef)

  private readonly LOGGED_KEY = 'isLoggedIn'

  private _user: WritableSignal<IUser | null> = signal(null)
  private _isLoggedIn: WritableSignal<boolean> = signal(false)

  private _hasUser: WritableSignal<boolean> = signal(false)
  private _hasLibrary: WritableSignal<boolean> = signal(false)
  private _hasBadges: WritableSignal<boolean> = signal(false)

  private apiUrl = 'http://localhost:3000'

  public login = () => {
    window.location.href = this.apiUrl + '/auth/steam'
  }

  public logout = () => {
    this._user.set(null)
    this._hasUser.set(false)
    this._hasLibrary.set(false)
    this._hasUser.set(false)
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

  public getUserInfo = (): Observable<[ILoginResponse, IUserGamesLibraryResponse, IGetBadgesResponse, IGetRecentlyPlayedGamesResponse, IFriendListFullResponse]> => {
    // Get user info
    const user = this.retrieveUser()

    // Get user's game library
    const library = this.steamService.getOwnedGames()

    // Get user's badge and account level info
    const badges = this.steamService.getUserBadges()

    // Get user's recently played games info
    const recentlyPlayedGames = this.steamService.getRecentlyPlayedGames()

    // Get user's friend list
    const friendList = this.steamService.initializeFriendList()

    // Return array of observables of requests as a fork join
    return forkJoin([user, library, badges, recentlyPlayedGames, friendList])
  }

  public initializeUser = () => {
    this.getUserInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([user, library, badges, recentlyPlayedGames, friendList]) => {
          const returnedData = this.mapAuthResponseToUser(user.response, library, badges, recentlyPlayedGames, friendList)
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

  public mapAuthResponseToUser = (user: ILoginResponseUser, library: IUserGamesLibraryResponse, badges: IGetBadgesResponse, recentlyPlayedGames: IGetRecentlyPlayedGamesResponse, friendList: IFriendListFullResponse): IUser => {
    const returnedUser: IUser = {
      identifier: user.identifier,
      steamId: user._json.steamid,
      communityVisibilityState: user._json.communityvisibilitystate,
      profileState: user._json.profilestate,
      personaName: user._json.personaname,
      commentPermission: user._json.commentpermission,
      profileUrl: user._json.profileurl,
      avatars: {
        avatar: user._json.avatar,
        avatarMedium: user._json.avatarmedium,
        avatarFull: user._json.avatarfull,
        avatarHash: user._json.avatarhash
      },
      lastLogoff: this.convertUnixTimeToCurrentTime(user._json.lastlogoff),
      personaState: user._json.personastate,
      primaryClanId: user._json.primaryclanid,
      timeCreated: user._json.timecreated,
      personaStateFlags: user._json.personastateflags,
      locCountryCode: user._json.loccountrycode,
      displayName: user.displayName,
      badges: this.mapBadgesResponse(badges.badges),
      playerLevel: {
        playerXp: badges.player_xp,
        playerLevel: badges.player_level,
        playerXpNeededToLevelUp: badges.player_xp_needed_to_level_up,
        playerXpNeededCurrentLevel: badges.player_xp_needed_current_level
      },
      gameLibrary: this.mapGameLibraryResponse(library.games),
      gameCount: library.game_count,
      recentlyPlayedGames: this.mapRecentlyPlayedGamesResponse(recentlyPlayedGames.games),
      friendList: this.mapFriendListResponse(friendList)
    }

    return returnedUser
  }

  private mapBadgesResponse = (responses: IGetBadgesResponseArray[]): IBadge[] => {
    const badges: IBadge[] = responses.map(response => {
      return {
        badgeId: response.badgeid,
        level: response.level,
        completionTime: response.completion_time,
        xp: response.xp,
        scarcity: response.scarcity
      }
    })
    return badges
  }

  private mapGameLibraryResponse = (responses: IUserGameInfoResponse[]): IUserGameInfo[] => {
    const games: IUserGameInfo[] = responses.map(response => {
      return {
        appId: response.appid,
        capsuleFilename: response.capsule_filename,
        contentDescriptorIds: response.content_descriptorids,
        hasDLC: response.has_dlc,
        hasMarket: response.has_market,
        hasWorkshop: response.has_workshop,
        imgIconUrl: response.img_icon_url,
        name: response.name,
        playtime2Weeks: response.playtime_2weeks,
        playtimeDeckForever: response.playtime_deck_forever,
        playtimeDisconnected: response.playtime_disconnected,
        playtimeForever: response.playtime_forever,
        playtimeLinuxForever: response.playtime_linux_forever,
        playtimeMacForever: response.playtime_mac_forever,
        playtimeWindowsForever: response.playtime_windows_forever,
        rTimeLastPlayed: response.rtime_last_played
      }
    })
    return games
  }

  private mapRecentlyPlayedGamesResponse = (responses: IGetRecentlyPlayedGamesResponseInfo[]): IRecentlyPlayedGame[] => {
    const games: IRecentlyPlayedGame[] = responses.map(response => {
      return {
        appId: response.appid,
        name: response.name,
        playtime2Weeks: response.playtime_2weeks,
        playtimeForever: response.playtime_forever,
        imgIconUrl: response.img_icon_url,
        playtimeWindowsForever: response.playtime_windows_forever,
        playtimeMacForever: response.playtime_mac_forever,
        playtimeLinuxForever: response.playtime_linux_forever,
        playtimeDeckForever: response.playtime_deck_forever
      }
    })
    return games
  }

  private mapFriendListResponse = (responses: IFriendListFullResponse): ISteamFriend[] => {
    const friends: ISteamFriend[] = responses.friendList.map(response => {
      const matchingDetails = responses.details.find(detail => detail.steamid === response.steamid)
      if (matchingDetails === undefined) {
        return {
          steamId: '',
          relationship: '',
          friendSince: '',
          communityVisibilityState: '',
          profileState: 0,
          displayName: '',
          profileUrl: '',
          avatars: {
            avatar: '',
            avatarMedium: '',
            avatarFull: '',
            avatarHash: ''
          },
          lastLogoff: '',
          personaState: 0,
          realName: '',
          primaryClanId: '',
          timeCreated: 0,
          personaStateFlags: 0,
          locCountryCode: '',
          locStateCode: ''
        }
      }
      else {
        return {
          steamId: response.steamid,
          relationship: response.relationship,
          friendSince: this.convertUnixTimeToCurrentTime(response.friend_since),
          communityVisibilityState: matchingDetails?.communityvisibilitystate.toString(),
          profileState: matchingDetails?.profilestate,
          displayName: matchingDetails?.personaname,
          profileUrl: matchingDetails?.profileurl,
          avatars: {
            avatar: matchingDetails?.avatar,
            avatarMedium: matchingDetails?.avatarmedium,
            avatarFull: matchingDetails?.avatarfull,
            avatarHash: matchingDetails?.avatarhash
          },
          lastLogoff: this.convertUnixTimeToCurrentTime(matchingDetails?.lastlogoff),
          personaState: matchingDetails?.personastate,
          realName: matchingDetails?.realname,
          primaryClanId: matchingDetails?.primaryclanid,
          timeCreated: matchingDetails?.timecreated,
          personaStateFlags: matchingDetails?.personastateflags,
          locCountryCode: matchingDetails?.loccountrycode,
          locStateCode: matchingDetails?.locstatecode,
          locCityId: matchingDetails?.loccityid !== undefined ? matchingDetails?.loccityid : '',
          currentGameId: matchingDetails?.gameid !== undefined ? matchingDetails?.gameid : '',
          gameServerIp: matchingDetails?.gameserverip !== undefined ? matchingDetails?.gameserverip : '',
          currentGameName: matchingDetails?.gameextrainfo !== undefined ? matchingDetails?.gameextrainfo : ''
        }
      }
    })
    return friends
  }

  private convertUnixTimeToCurrentTime = (unix: number): string => {
    return new Date(unix * 1000).toISOString().slice(0, new Date(unix * 1000).toISOString().indexOf('T'))
  }

  public isTokenValid = (): Observable<boolean> => {
    return this.http.get<boolean>(this.apiUrl + '/auth/token-valid', { withCredentials: true })
  }
}
