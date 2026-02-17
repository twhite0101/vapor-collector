import { HttpClient } from '@angular/common/http'
import type { WritableSignal } from '@angular/core'
import { DestroyRef, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router'
import type { Observable } from 'rxjs'
import { firstValueFrom, forkJoin } from 'rxjs'
import type { IBadge, IFriendListDetailsResponseFriend, IFriendListFullResponse, IGetBadgesFullResponse, IGetBadgesResponseArray, IGetRecentlyPlayedGamesResponse, IGetRecentlyPlayedGamesResponseInfo, ILoginResponse, INewsItems, IRecentlyPlayedGame, ISteamFriend, IUser, IUserFullResponse, IUserGameInfo, IUserGameInfoResponse, IUserGamesLibraryResponse } from '../../models/Steam'
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

  public getUserInfo = (): Observable<[IUserFullResponse, IUserGamesLibraryResponse, IGetBadgesFullResponse, IGetRecentlyPlayedGamesResponse, IFriendListFullResponse]> => {
    // Get user info
    const user = this.initializeUserDetails()

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
    this.loadingService.loadingOn()
    this.getUserInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([user, library, badges, recentlyPlayedGames, friendList]) => {
          const returnedData = this.mapAuthResponseToUser(user, library, badges, recentlyPlayedGames, friendList)
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

  public mapAuthResponseToUser = (userFull: IUserFullResponse, library: IUserGamesLibraryResponse, badgesFull: IGetBadgesFullResponse, recentlyPlayedGames: IGetRecentlyPlayedGamesResponse, friendList: IFriendListFullResponse): IUser => {
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
      playTime2Weeks: this.calculateRecentPlayTime(recentlyPlayedGames.games),
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
      gameLibrary: this.mapGameLibraryResponse(library.games),
      gameCount: library.game_count,
      recentlyPlayedGames: this.sortRecentlyPlayedGame(this.mapRecentlyPlayedGamesResponse(recentlyPlayedGames.games, library.games)),
      friendList: this.mapFriendListResponse(friendList),
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

  private mapRecentlyPlayedGamesResponse = (responses: IGetRecentlyPlayedGamesResponseInfo[], library: IUserGameInfoResponse[]): IRecentlyPlayedGame[] => {
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
        playtimeDeckForever: response.playtime_deck_forever,
        dateLastPlayed: this.setLastTimePlayed(response.appid, library)
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

  private mapGameNewsResponse = (user: IUserGameInfoResponse): INewsItems[] => {
    if (user.news === undefined) {
      const noNews: INewsItems[] = [{
        globalId: '',
        title: '',
        url: '',
        isExternalUrl: false,
        author: '',
        contents: '',
        feedLabel: '',
        date: new Date(),
        feedName: '',
        feedType: 0
      }]
      return noNews
    }
    const newsItems: INewsItems[] = user.news.map(news => {
      return {
        globalId: news.gid,
        title: news.title,
        url: news.url,
        isExternalUrl: news.is_external_url,
        author: news.author,
        contents: news.contents,
        feedLabel: news.feedlabel,
        date: new Date(news.date * 1000),
        feedName: news.feedname,
        feedType: news.feed_type
      }
    })
    return newsItems
  }

  private convertUnixTimeToCurrentTime = (unix: number): string => {
    return new Date(unix * 1000).toISOString().slice(0, new Date(unix * 1000).toISOString().indexOf('T'))
  }

  private setLastTimePlayed = (gameId: number, library: IUserGameInfoResponse[]): Date => {
    const matchingGame = library.find(game => game.appid === gameId)
    if (matchingGame === undefined) {
      return new Date()
    }
    return new Date(matchingGame.rtime_last_played * 1000)
  }

  private sortRecentlyPlayedGame = (recentGames: IRecentlyPlayedGame[]): IRecentlyPlayedGame[] => {
    const currentDate = new Date()

    recentGames.sort((gameA, gameB) => {
      const dateGameA = new Date(gameA.dateLastPlayed).getTime()
      const dateGameB = new Date(gameB.dateLastPlayed).getTime()

      const diffGameA = Math.abs(dateGameA - currentDate.getTime())
      const diffGameB = Math.abs(dateGameB - currentDate.getTime())

      return diffGameA - diffGameB
    })

    return recentGames
  }

  private calculateRecentPlayTime = (recentGames: IGetRecentlyPlayedGamesResponseInfo[]): number => {
    let recentPlayTime = 0
    recentGames.forEach(game => {
      recentPlayTime += game.playtime_2weeks
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
