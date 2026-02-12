import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { IFriendListDetailsResponseFriend, IFriendListFullResponse, IFriendListResponseFriend, IGetBadgesResponse, IGetRecentlyPlayedGamesResponse, IUserGamesLibraryResponse } from '../../../models/Steam'

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
    const response = await firstValueFrom(this.http.get<IGetBadgesResponse>(this.apiUrl + '/user/getUserBadges', { withCredentials: true }))
    return response
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
