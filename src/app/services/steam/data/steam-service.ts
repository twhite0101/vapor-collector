import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import type { Observable } from 'rxjs'
import { firstValueFrom, forkJoin } from 'rxjs'
import type { IFriendListDetailsResponseFriend, IFriendListFullResponse, IFriendListResponseFriend, IGetBadgesFullResponse, IGetBadgesResponse, IGetGameNewsResponse, IGetRecentlyPlayedGamesResponse, IPlayLevelPercentileResponse, IUserGamesLibraryResponse } from '../../../models/Steam'

@Injectable({
  providedIn: 'root'
})
export class SteamService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)

  private apiUrl = 'http://localhost:3000'

  public getOwnedGames = async () => {
    const response = await firstValueFrom(this.http.get<IUserGamesLibraryResponse>(this.apiUrl + '/user/getGameLibrary', { withCredentials: true }))
    const library = this.calculateGameLibraryHoursPlayed(response)
    return library
  }

  public getUserBadges = async () => {
    const badgesDetails = await firstValueFrom(this.http.get<IGetBadgesResponse>(this.apiUrl + '/user/getUserBadges', { withCredentials: true }))

    const levelPercentile = await firstValueFrom(this.http.get<IPlayLevelPercentileResponse>(this.apiUrl + `/user/levelPercent?level=${badgesDetails.player_level}`, { withCredentials: true }))

    const badges: IGetBadgesFullResponse = {
      badges: badgesDetails,
      levelPercentile: levelPercentile
    }

    return badges
  }

  public getRecentlyPlayedGames = async () => {
    const response = await firstValueFrom(this.http.get<IGetRecentlyPlayedGamesResponse>(this.apiUrl + '/user/getRecentlyPlayedGames', { withCredentials: true }))
    const recentGames = this.calculateRecentGamesHoursPlayed(response)
    return recentGames
  }

  public getFriendList = async () => {
    const response = await firstValueFrom(this.http.get<IFriendListResponseFriend[]>(this.apiUrl + '/user/getFriendList', { withCredentials: true }))
    return response
  }

  public getFriendListDetails = async (ids: string[]) => {
    const steamIdsParams = ids.join('%2C')
    const response = await firstValueFrom(this.http.get<IFriendListDetailsResponseFriend[]>(this.apiUrl + `/user/getFriendListDetails?steamIds=${steamIdsParams}`, { withCredentials: true }))
    return response
  }

  public initializeFriendList = async () => {
    const friendList = await this.getFriendList()

    const steamIds = friendList.map(friend => {
      return friend.steamid
    })

    const friendListDetails = await this.getFriendListDetails(steamIds)

    const friendListFull: IFriendListFullResponse = {
      friendList: friendList,
      details: friendListDetails
    }
    return friendListFull
  }

  public initializeLibrary = async () => {
    const ownedGames = await this.getOwnedGames()

    const appIds = ownedGames.games.map(game => {
      return game.appid
    })

    const ownedGamesNews$: Observable<IGetGameNewsResponse>[] = appIds.map(id => this.http.get<IGetGameNewsResponse>(this.apiUrl + `/user/getNewsForGame?appId=${id}`, { withCredentials: true }))

    const returnedNewsResults = await firstValueFrom(forkJoin(ownedGamesNews$))

    const finalizedLibrary = ownedGames.games.map(game => {
      const gameNewsMatch = returnedNewsResults.find(newsGame => newsGame.appid === game.appid)

      if (gameNewsMatch) {
        game.news = gameNewsMatch.newsitems
      }

      return game
    })

    ownedGames.games = finalizedLibrary

    return ownedGames
  }

  protected calculateGameLibraryHoursPlayed = (library: IUserGamesLibraryResponse): IUserGamesLibraryResponse => {
    library.games.forEach(game => {
      game.playtime_forever = isNaN(game.playtime_forever) ? 0 : Math.round(((game.playtime_forever / 60) + Number.EPSILON) * 100) / 100
      game.playtime_2weeks = isNaN(game.playtime_2weeks) ? 0 : Math.round(((game.playtime_2weeks / 60) + Number.EPSILON) * 100) / 100
      game.playtime_deck_forever = isNaN(game.playtime_deck_forever) ? 0 : Math.round(((game.playtime_deck_forever / 60) + Number.EPSILON) * 100) / 100
    })

    return library
  }

  protected calculateRecentGamesHoursPlayed = (library: IGetRecentlyPlayedGamesResponse): IGetRecentlyPlayedGamesResponse => {
    library.games.forEach(game => {
      game.playtime_forever = isNaN(game.playtime_forever) ? 0 : Math.round(((game.playtime_forever / 60) + Number.EPSILON) * 100) / 100
      game.playtime_2weeks = isNaN(game.playtime_2weeks) ? 0 : Math.round(((game.playtime_2weeks / 60) + Number.EPSILON) * 100) / 100
      game.playtime_deck_forever = isNaN(game.playtime_deck_forever) ? 0 : Math.round(((game.playtime_deck_forever / 60) + Number.EPSILON) * 100) / 100
    })

    return library
  }
}
