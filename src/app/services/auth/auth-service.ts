import { HttpClient } from '@angular/common/http'
import type { WritableSignal } from '@angular/core'
import { DestroyRef, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router'
import type { Observable } from 'rxjs'
import { firstValueFrom, forkJoin } from 'rxjs'
import type { IBadge, IFriendGameResponse, IFriendListDetailsResponseFriend, IFriendListFullResponse, IGetBadgesFullResponse, IGetBadgesResponseArray, ILoginResponse, ISteamFriend, IUser, IUserFullResponse, IUserGameInfo, IUserGameInfoResponse, IUserGamesLibraryResponse } from '../../models/Steam'
import { LoadingService } from '../loading/loading-service'
import { StateService } from '../state/state-service'
import { SteamService } from '../steam/data/steam-service'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)
  private readonly steamService: SteamService = inject(SteamService)
  private readonly loadingService: LoadingService = inject(LoadingService)
  private readonly state: StateService = inject(StateService)
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
    const response = await firstValueFrom(this.http.get<IFriendListDetailsResponseFriend[]>(this.apiUrl + `/user/getFriendListDetails?steamIds=${id}`, { withCredentials: true }))
    return response
  }

  public initializeUserDetails = async () => {
    const user = await this.retrieveUser()

    const userAdditionalDetails = await this.getUserAdditionalDetails(user.response._json.steamid)

    const userFull: IUserFullResponse = {
      user: user.response,
      additionalDetails: userAdditionalDetails
    }
    return userFull
  }

  public getUserInfo = (): Observable<[IUserFullResponse, IUserGamesLibraryResponse, IGetBadgesFullResponse, IFriendListFullResponse]> => {
    // Get user info
    const user = this.initializeUserDetails()

    // Get user's game library
    const library = this.steamService.getOwnedGames()

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
          const returnedData = this.mapAuthResponseToUser(user, library, badges, friendList)
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

  public mapAuthResponseToUser = (userFull: IUserFullResponse, library: IUserGamesLibraryResponse, badgesFull: IGetBadgesFullResponse, friendList: IFriendListFullResponse): IUser => {
    const returnedUser: IUser = {
      steamId: userFull.user._json.steamid,
      communityVisibilityState: userFull.user._json.communityvisibilitystate,
      profileState: userFull.user._json.profilestate,
      personaName: userFull.user._json.personaname,
      commentPermission: userFull.user._json.commentpermission,
      profileUrl: userFull.user._json.profileurl,
      avatars: {
        avatar: userFull.user._json.avatar,
        avatarMedium: userFull.user._json.avatarmedium,
        avatarFull: userFull.user._json.avatarfull,
        avatarHash: userFull.user._json.avatarhash
      },
      lastLogoff: this.convertUnixTimeToCurrentTime(userFull.user._json.lastlogoff),
      personaState: userFull.user._json.personastate,
      status: this.setUserStatus(userFull.user._json.personastate),
      primaryClanId: userFull.user._json.primaryclanid,
      timeCreated: this.convertUnixTimeToCurrentTime(userFull.user._json.timecreated),
      profileAgeYears: this.calculateProfileAgeYears(userFull.user._json.timecreated),
      personaStateFlags: userFull.user._json.personastateflags,
      locCountryCode: userFull.user._json.loccountrycode,
      displayName: userFull.user.displayName,
      badges: this.mapBadgesResponse(badgesFull.badges.badges),
      playerLevel: {
        playerXp: badgesFull.badges.player_xp,
        playerLevel: badgesFull.badges.player_level,
        playerXpNeededToLevelUp: badgesFull.badges.player_xp_needed_to_level_up,
        playerXpNeededCurrentLevel: badgesFull.badges.player_xp_needed_current_level,
        levelPercentile: Math.ceil(badgesFull.levelPercentile.player_level_percentile * 100 ) / 100
      },
      friendList: this.mapFriendListResponse(friendList),
      gameLibrary: this.sortGamesByRecentlyPlayed(this.mapGameLibraryResponse(library.games, true)),
      gameCount: library.game_count,
      currentGameId: userFull.additionalDetails[0].gameid !== undefined ? userFull.additionalDetails[0].gameid: '',
      gameServerIp: userFull.additionalDetails[0].gameserverip !== undefined ? userFull.additionalDetails[0].gameserverip : '',
      currentGameName: userFull.additionalDetails[0].gameextrainfo !== undefined ? userFull.additionalDetails[0].gameextrainfo : ''
    }

    return returnedUser
  }

  private setUserStatus = (personaState: number): string => {
    let status: string
    switch (personaState) {
      case 0:
        status = 'Offline'
        break
      case 1:
        status = 'Online'
        break
      case 2:
        status = 'Busy'
        break
      case 3:
        status = 'Away'
        break
      case 4:
        status = 'Snooze'
        break
      case 5:
        status = 'looking for trade'
        break
      case 6:
        status = 'looking to play'
        break
      default:
        status = ''
    }
    return status
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

  private mapGameLibraryResponse = (responses: IUserGameInfoResponse[], isAuthUser: boolean): IUserGameInfo[] => {
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
        playtime2Weeks: isAuthUser ? response.playtime_2weeks : this.formatFriendPlayTime(response.playtime_2weeks),
        playtimeDeckForever: isAuthUser ? response.playtime_deck_forever : this.formatFriendPlayTime(response.playtime_deck_forever),
        playtimeDisconnected: isAuthUser ? response.playtime_disconnected : this.formatFriendPlayTime(response.playtime_disconnected),
        playtimeForever: isAuthUser ? response.playtime_forever : this.formatFriendPlayTime(response.playtime_forever),
        playtimeLinuxForever: isAuthUser ? response.playtime_linux_forever : this.formatFriendPlayTime(response.playtime_linux_forever),
        playtimeMacForever: isAuthUser ? response.playtime_mac_forever : this.formatFriendPlayTime(response.playtime_mac_forever),
        playtimeWindowsForever: isAuthUser ? response.playtime_windows_forever : this.formatFriendPlayTime(response.playtime_windows_forever),
        dateLastPlayed: new Date(response.rtime_last_played * 1000)
      }
    })
    return games
  }

  private formatFriendPlayTime = (time: number): number => {
    return time !== undefined ? Number((time / 60).toFixed(1)) : 0
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
          locStateCode: '',
          gameLibrary: []
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
          currentGameName: matchingDetails?.gameextrainfo !== undefined ? matchingDetails?.gameextrainfo : '',
          gameLibrary: this.findFriendGameLibrary(Number(response.steamid), responses.gameLibraries)
        }
      }
    })
    return friends
  }

  private findFriendGameLibrary = (steamId: number, gameLibraries: IFriendGameResponse[]): IUserGameInfo[] => {
    const matchingUser = gameLibraries.find(library => Number(library.steamId) === steamId)

    if (!matchingUser || matchingUser.libraryResponse.games === undefined) {
      return []
    }
    else {
      const mappedGames = this.mapGameLibraryResponse(matchingUser.libraryResponse.games, false)
      return mappedGames
    }
  }

  private convertUnixTimeToCurrentTime = (unix: number): string => {
    return new Date(unix * 1000).toISOString().slice(0, new Date(unix * 1000).toISOString().indexOf('T'))
  }

  private sortGamesByRecentlyPlayed = (games: IUserGameInfo[]): IUserGameInfo[] => {
    const currentDate = new Date()

    games.sort((gameA, gameB) => {
      const dateGameA = new Date(gameA.dateLastPlayed).getTime()
      const dateGameB = new Date(gameB.dateLastPlayed).getTime()

      const diffGameA = Math.abs(dateGameA - currentDate.getTime())
      const diffGameB = Math.abs(dateGameB - currentDate.getTime())

      return diffGameA - diffGameB
    })

    return games
  }

  public calculateRecentPlayTime = (recentGames: IUserGameInfo[]): number => {
    let recentPlayTime = 0
    recentGames.forEach(game => {
      recentPlayTime += game.playtime2Weeks
    })
    return Math.ceil(recentPlayTime * 10) / 10
  }

  private calculateProfileAgeYears = (timeCreate: number): number => {
    const createdDate = new Date(timeCreate * 1000)
    const currentDate = new Date()

    let years = currentDate.getFullYear() - createdDate.getFullYear()

    const monthDiff = currentDate.getMonth() - createdDate.getMonth()
    const daysDiff = currentDate.getDate() - createdDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && daysDiff < 0)) {
      years--
    }

    return Math.abs(years)
  }

  public isTokenValid = (): Observable<boolean> => {
    return this.http.get<boolean>(this.apiUrl + '/auth/token-valid', { withCredentials: true })
  }
}
