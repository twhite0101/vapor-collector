import { HttpClient } from '@angular/common/http'
import type { WritableSignal } from '@angular/core'
import { inject, Injectable, signal } from '@angular/core'
import type { Observable } from 'rxjs'
import { firstValueFrom, forkJoin, map } from 'rxjs'
import type { IAccountValueDetails, IFriendGameFullResponse, IFriendGameResponse, IFriendListFullResponse, IFriendListResponseFriend, IFriendsWhoPlay, IGameName, IGamePrice, IGamePriceOverviewResponse, IGamePriceResponseDetails, IGamePriceResponseFormat, IGameSchemaResponse, IGetBadgesFullResponse, IGetBadgesResponse, IGetGameNewsResponse, IPlayerLevel, IPlayLevelPercentileResponse, IProfileAvatar, IProfileBackground, IProfileItems, IProfileItemsResponse, IProfileModifier, IProfileStyle, ISteamFriend, IUserAchievementsResponse, IUserAdditionalDetailsResponse, IUserGameInfo, IUserGameInfoResponse, IUserGamesLibraryResponse, IWishlistResponse, IWishlistResponseWithPrices } from '../../../models/Steam'
import { UtilsService } from '../../utils/utils-service'

const LIBRARY_PLAY_TIME_TYPES = ['playtime_forever', 'playtime_2weeks', 'playtime_deck_forever', 'playtime_disconnected', 'playtime_linux_forever', 'playtime_mac_forever', 'playtime_windows_forever'] as const

@Injectable({
  providedIn: 'root'
})
export class SteamService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)
  private readonly utilsService: UtilsService = inject(UtilsService)

  private apiUrl = 'http://localhost:3000'

  private _friendListLength: WritableSignal<number> = signal(0)

  public get friendListLength () {
    return this._friendListLength()
  }

  public getOwnedGames = async () => {
    const response = await firstValueFrom(this.http.get<IUserGamesLibraryResponse>(this.apiUrl + '/user/getGameLibrary', { withCredentials: true }))
    const library = this.calculateGameLibraryHoursPlayed(response)
    return library
  }

  public getUserBadges = async (steamId?: string) => {
    const endpoint = steamId !== undefined ? `/user/getUserBadges?steamId=${steamId}` : '/user/getUserBadges'

    const badgesDetails = await firstValueFrom(this.http.get<IGetBadgesResponse>(this.apiUrl + endpoint, { withCredentials: true }))

    const levelPercentile = await firstValueFrom(this.http.get<IPlayLevelPercentileResponse>(this.apiUrl + `/user/levelPercent?level=${badgesDetails.player_level}`, { withCredentials: true }))

    const badges: IGetBadgesFullResponse = {
      badges: badgesDetails,
      levelPercentile: levelPercentile
    }

    return badges
  }

  public getFriendList = async () => {
    const response = await firstValueFrom(this.http.get<IFriendListResponseFriend[]>(this.apiUrl + '/user/getFriendList', { withCredentials: true }))
    return response
  }

  public getFriendListDetails = async (ids: string[]) => {
    const steamIdsParams = ids.join('%2C')
    const response = await firstValueFrom(this.http.get<IUserAdditionalDetailsResponse[]>(this.apiUrl + `/user/getAdditionalUserDetails?steamIds=${steamIdsParams}`, { withCredentials: true }))
    return response
  }

  public getGameNews = async (gameId: string) => {
    const response = firstValueFrom(this.http.get<IGetGameNewsResponse>(this.apiUrl + `/game/getNewsForGame?appId=${gameId}`, { withCredentials: true }))
    return response
  }

  public getConcurrentPlayers = async (gameId: string) => {
    const response = firstValueFrom(this.http.get<number>(this.apiUrl + `/game/getConcurrentPlayers?appId=${gameId}`, { withCredentials: true }))
    return response
  }

  public getUserStatsForGame = async (gameId: string) => {
    const response = firstValueFrom(this.http.get(this.apiUrl + `/game/getUserStatsForGame?appId=${gameId}`, { withCredentials: true }))
    return response
  }

  public getSchemaForGame = async (gameId: string) => {
    const response = firstValueFrom(this.http.get<IGameSchemaResponse>(this.apiUrl + `/game/getSchemaForGame?appId=${gameId}`, { withCredentials: true }))
    return response
  }

  public getUserAchievements = async (gameId: string, steamId?: number) => {
    const endpoint = steamId !== undefined ? `/game/getUserAchievements?steamId=${steamId}&?appId=${gameId}` : `/game/getUserAchievements?appId=${gameId}`
    const response = firstValueFrom(this.http.get<IUserAchievementsResponse>(this.apiUrl + endpoint, { withCredentials: true }))
    return response
  }

  public getGamePrices = async (gameIds: string) => {
    const response = firstValueFrom(this.http.get<IGamePriceResponseDetails[]>(this.apiUrl + `/game/getGamePrices?appId=${gameIds}`, { withCredentials: true }))
    return response
  }

  private getMultipleGamePrices = async (appIdArrays: number[][]) => {
    const gamePrices$: Observable<IGamePriceResponseDetails[]>[] = appIdArrays.map(chunk => this.http.get<IGamePriceResponseDetails[]>(this.apiUrl + `/game/getGamePrices?appId=${chunk.join(',')}`, { withCredentials: true }))

    const gamePricesResponse = await firstValueFrom(forkJoin(gamePrices$)
      .pipe(
        map(result => {
          return result.map(chunkObj => {
            return Object.entries(chunkObj).map(([key, value]) => {
              return value
            })
          })
        })
      )).then(response => {
      return response.flat()
    })

    return gamePricesResponse
  }

  public getWishlist = async (steamId: string) => {
    const response = firstValueFrom(this.http.get<IWishlistResponse[]>(this.apiUrl + `/user/getWishlist?steamId=${steamId}`, { withCredentials: true }))
    return response
  }

  public getProfileItems = async () => {
    const response = firstValueFrom(this.http.get<IProfileItemsResponse>(this.apiUrl + '/user/getProfileItems', { withCredentials: true }))
    return response
  }

  public initializeWishlist = async (steamId: string) => {
    const wishlist = await this.getWishlist(steamId)
    let gamePrices: IGamePriceResponseDetails[] = []
    const appIds = wishlist.map(game => game.appid)
    if (appIds.length >= 300) {
      const multipleReqArrays: number[][] = this.utilsService.separateArrayIntoChunks(appIds, 300)

      gamePrices = await this.getMultipleGamePrices(multipleReqArrays)
    }
    else {
      gamePrices = await this.getGamePrices(appIds.join(','))
    }

    const gameNames$: Observable<IGameName>[] = appIds.map(id => this.http.get<IGameName>(this.apiUrl + `/game/getGameName?appId=${id}`, { withCredentials: true }))

    const gameNamesResponse = await firstValueFrom(forkJoin(gameNames$))

    const wishListWithPrices: IWishlistResponseWithPrices[] = wishlist.map(game => {
      const matchingIdIndex = appIds.indexOf(game.appid)
      if (gamePrices[matchingIdIndex].success === false) {
        const gameWithPrice: IWishlistResponseWithPrices = {
          appid: game.appid,
          priority: game.priority,
          date_added: game.date_added,
          priceCurrent: 0,
          priceInitial: 0,
          name: gameNamesResponse[matchingIdIndex] !== null ? gameNamesResponse[matchingIdIndex].name : ''
        }
        return gameWithPrice
      }
      else {
        const gameWithPrice: IWishlistResponseWithPrices = {
          appid: game.appid,
          priority: game.priority,
          date_added: game.date_added,
          priceCurrent: gamePrices[matchingIdIndex].data.price_overview !== undefined ? gamePrices[matchingIdIndex].data.price_overview.final : 0,
          priceInitial: gamePrices[matchingIdIndex].data.price_overview !== undefined ? gamePrices[matchingIdIndex].data.price_overview.initial : 0,
          name: gameNamesResponse[matchingIdIndex] !== null ? gameNamesResponse[matchingIdIndex].name : ''
        }
        return gameWithPrice
      }
    })
    const wishListFormatter = wishListWithPrices.filter(item => item.name !== '')
    return wishListFormatter
  }

  public initializeGameLibrary = async () => {
    const gameLibrary = await this.getOwnedGames()

    let gamePrices: IGamePriceResponseDetails[] = []
    const appIds = gameLibrary.games.map(game => {
      return game.appid
    })
    if (appIds.length >= 300) {
      const multipleReqArrays: number[][] = this.utilsService.separateArrayIntoChunks(appIds, 300)

      gamePrices = await this.getMultipleGamePrices(multipleReqArrays)
    }
    else {
      gamePrices = await firstValueFrom(this.http.get<IGamePriceResponseDetails[]>(this.apiUrl + `/game/getGamePrices?appId=${appIds.join(',')}`, { withCredentials: true }))
    }

    gameLibrary.games.forEach(game => {
      appIds.forEach((id, i) => {
        if (game.appid === id) {
          if (gamePrices[i].success === false) {
            game.prices = this.createNewPriceObject()
          }
          else {
            game.prices = gamePrices[i].data.price_overview !== undefined ? gamePrices[i].data.price_overview : this.createNewPriceObject()
          }
        }
      })
    })

    return gameLibrary
  }

  public initializeFriendList = async () => {
    const friendList = await this.getFriendList()

    this._friendListLength.set(friendList.length)

    const steamIds = friendList.map(friend => {
      return friend.steamid
    })

    const friendListGames$: Observable<IUserGamesLibraryResponse>[] = steamIds.map(id => this.http.get<IUserGamesLibraryResponse>(this.apiUrl + `/user/getGameLibrary?steamId=${id}`, { withCredentials: true }))

    const friendListGamesResponse = await firstValueFrom(forkJoin(friendListGames$)
      .pipe(
        map(result => {
          return result.map((library, i) => {
            if (library.games) {
              const friendGameResponse: IFriendGameResponse = {
                libraryResponse: library,
                steamId: steamIds[i]
              }
              return friendGameResponse
            }
            else {
              const friendGameResponse: IFriendGameResponse = {
                libraryResponse: library,
                steamId: steamIds[i]
              }
              return friendGameResponse
            }
          })
        })
      ))

    const friendListResponseSplit: IFriendGameFullResponse[] = []

    friendListGamesResponse.forEach(response => {
      if (Object.keys(response.libraryResponse).length > 0) {
        if (response.libraryResponse.game_count < 300) {
          const formattedResponse: IFriendGameFullResponse = {
            steamId: response.steamId,
            libraryResponse: response.libraryResponse,
            appIds: response.libraryResponse.games.map(game => game.appid).join(',')
          }
          friendListResponseSplit.push(formattedResponse)
        }
        else {
          const multipleReqArrays: number[][] = []
          const appIdChunkSize = 300
          const appIds = response.libraryResponse.games.map(game => game.appid)
          for (let i = 0; i < response.libraryResponse.game_count; i += appIdChunkSize) {
            const chunk = appIds.slice(i, i + appIdChunkSize)
            multipleReqArrays.push(chunk)
          }

          multipleReqArrays.forEach(chunk => {
            const formattedResponse: IFriendGameFullResponse = {
              steamId: response.steamId,
              libraryResponse: response.libraryResponse,
              appIds: chunk.join(',')
            }
            friendListResponseSplit.push(formattedResponse)
          })
        }
      }
    })

    friendListResponseSplit.forEach((friend, i) => {
      friend.index = i
    })

    const friendListGamesPrices$: Observable<IGamePriceResponseDetails[]>[] = friendListResponseSplit.map(friend => this.http.get<IGamePriceResponseDetails[]>(this.apiUrl + `/game/getGamePrices?appId=${friend.appIds}`, { withCredentials: true }))

    const gamePrices = await firstValueFrom(forkJoin(friendListGamesPrices$)
      .pipe(
        map(result => {
          return result.map(user => {
            const appIds = Object.keys(user)
            return Object.values(user).map((game: IGamePriceResponseDetails, i) => {
              const appId = appIds[i]
              if (game.success === true) {
                const formattedResponse: IGamePriceResponseFormat = {
                  appId: Number(appId),
                  price_overview: Array.isArray(game.data) ? this.createNewPriceObject() : game.data.price_overview
                }
                return formattedResponse
              }
              else {
                const formattedResponse: IGamePriceResponseFormat = {
                  appId: Number(appId),
                  price_overview: this.createNewPriceObject()
                }
                return formattedResponse
              }
            })
          })
        })
      ))

    friendListGamesResponse.forEach(friend => {
      if (!friend.libraryResponse.games) {
        return
      }
      const matchingUserPriceIndexes = friendListResponseSplit.filter(user => {
        return user.steamId === friend.steamId
      })
      let combinedArrays: IGamePriceResponseFormat[]
      if (matchingUserPriceIndexes && matchingUserPriceIndexes.every(match => match.index !== undefined)) {
        matchingUserPriceIndexes.forEach(match => {
          combinedArrays = [...gamePrices[match.index as number]]
        })
      }
      friend.libraryResponse.games.forEach(game => {
        const matchingPrice = combinedArrays.find(price => price.appId === game.appid)
        if (matchingPrice) {
          game.prices = matchingPrice.price_overview
        }
        else {
          game.prices = this.createNewPriceObject()
        }
      })
    })

    const friendListProfileItems$: Observable<IProfileItemsResponse>[] = steamIds.map(id => this.http.get<IProfileItemsResponse>(this.apiUrl + `/user/getProfileItems?steamId=${id}`, { withCredentials: true }))

    const friendListProfileItemsResponse = await firstValueFrom(forkJoin(friendListProfileItems$))

    const friendListDetails = await this.getFriendListDetails(steamIds)
    const friendListFull: IFriendListFullResponse = {
      friendList: friendList,
      details: friendListDetails,
      gameLibraries: friendListGamesResponse,
      profileItems: friendListProfileItemsResponse
    }
    return friendListFull
  }

  public initializeGameInfo = (gameId: string) => {
    const gameNews = this.getGameNews(gameId)

    const concurrent = this.getConcurrentPlayers(gameId)

    const gameSchema = this.getSchemaForGame(gameId)

    const userAchievements = this.getUserAchievements(gameId)

    return forkJoin([gameNews, concurrent, gameSchema, userAchievements])
  }

  private getMultipleSchemas = (gameIds:number[]) => {
    const friendGameSchema$: Observable<IGameSchemaResponse>[] = gameIds.map(id => this.http.get<IGameSchemaResponse>(this.apiUrl + `/game/getSchemaForGame?appId=${id}`, { withCredentials: true }))

    return forkJoin(friendGameSchema$)
  }

  private getFriendLibraryAchievements = (gameIds:number[], steamId: string) => {
    const friendGamesAchievements$: Observable<IUserAchievementsResponse>[] = gameIds.map(id => this.http.get<IUserAchievementsResponse>(this.apiUrl + `/game/getUserAchievements?steamId=${steamId}&?appId=${id}`, { withCredentials: true }))

    return forkJoin(friendGamesAchievements$)
  }

  public initializeFriendAchievements = (gameIds: number[], steamId: string) => {
    const gameSchemas = this.getMultipleSchemas(gameIds)

    const friendAchievements = this.getFriendLibraryAchievements(gameIds, steamId)

    return forkJoin([gameSchemas, friendAchievements])
  }

  protected calculateGameLibraryHoursPlayed = (library: IUserGamesLibraryResponse): IUserGamesLibraryResponse => {
    library.games.forEach(game => {
      LIBRARY_PLAY_TIME_TYPES.forEach(type => {
        game[type] = this.utilsService.formatHourValues(game[type])
      })
    })

    return library
  }

  public findFriendsWhoPlayGame = (gameId: number, friendList: ISteamFriend[]): IFriendsWhoPlay[] => {
    const formattedFriends: IFriendsWhoPlay[] = []
    const matchingFriends = friendList.filter(friend => {
      return friend.gameLibrary.some(game => game.appId === gameId)
    })
    matchingFriends.forEach(friend => {
      const matchingGame = friend.gameLibrary.find(game => game.appId === gameId)
      if (matchingGame) {
        formattedFriends.push({
          ...friend,
          selectedGame: matchingGame
        })
      }
      else {
        formattedFriends.push({
          ...friend,
          selectedGame: this.createdNewUserGameInfo()
        })
      }
    })
    return formattedFriends
  }

  public createdNewUserGameInfo = (response?: IUserGameInfoResponse): IUserGameInfo => {
    if (response) {
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
        dateLastPlayed: new Date(response.rtime_last_played * 1000),
        prices: {
          currency: response.prices.currency,
          initial: response.prices.initial,
          final: response.prices.final,
          discountPercent: response.prices.discount_percent,
          initialFormatted: response.prices.initial_formatted,
          finalFormatted: response.prices.final_formatted
        }
      }
    }
    else {
      return {
        appId: 0,
        capsuleFilename: '',
        contentDescriptorIds: [],
        hasDLC: false,
        hasMarket: false,
        hasWorkshop: false,
        imgIconUrl: '',
        name: '',
        playtime2Weeks: 0,
        playtimeDeckForever: 0,
        playtimeDisconnected: 0,
        playtimeForever: 0,
        playtimeLinuxForever: 0,
        playtimeMacForever: 0,
        playtimeWindowsForever: 0,
        dateLastPlayed: new Date(),
        prices: {
          currency: 'USD',
          initial: 0,
          final: 0,
          discountPercent: 0,
          initialFormatted: '',
          finalFormatted: ''
        }
      }
    }
  }

  private createNewPriceObject = (): IGamePriceOverviewResponse => {
    return {
      currency: '',
      initial: 0,
      final: 0,
      discount_percent: 0,
      initial_formatted: '',
      final_formatted: ''
    }
  }

  public createNewGameInfoPrice = (): IGamePrice => {
    return {
      currency: '',
      initial: 0,
      final: 0,
      discountPercent: 0,
      initialFormatted: '',
      finalFormatted: ''
    }
  }

  public createNewAccountValueDetails = (): IAccountValueDetails => {
    return {
      totalEstLibraryValue: 0,
      totalEstLibraryValueFormatted: '',
      currentEstLibraryValue: 0,
      currentEstLibraryValueFormatted: '',
      averageCostPerGameTotal: 0,
      averageCostPerGameTotalFormatted: '',
      averageCostPerGameCurrent: 0,
      averageCostPerGameCurrentFormatted: '',
      averageValuePerHourTotal: 0,
      averageValuePerHourTotalFormatted: '',
      averageValuePerHourCurrent: 0,
      averageValuePerHourCurrentFormatted: ''
    }
  }

  public createPlayerLevel = (): IPlayerLevel => {
    return {
      playerXp: 0,
      playerLevel: 0,
      playerXpNeededToLevelUp: 0,
      playerXpNeededCurrentLevel: 0,
      levelPercentile: 0
    }
  }

  public createProfileItems = (): IProfileItems => {
    return {
      background: this.createBackgroundItem(),
      avatarFrame: this.createAvatarItem(),
      animatedAvatar: this.createAvatarItem(),
      profileModifier: this.createModifierItem()
    }
  }

  public createBackgroundItem = (): IProfileBackground => {
    return {
      communityItemId: '',
      imageLargeURL: '',
      name: '',
      description: '',
      appId: 0,
      type: 0,
      class: 0,
      movieWebmURL: '',
      movieMP4URL: '',
      movieWebmSmallURL: '',
      movieMP4SmallURL: '',
      equipped: false
    }
  }

  public createAvatarItem = (): IProfileAvatar => {
    return {
      communityItemId: '',
      name: '',
      description: '',
      appId: 0,
      type: 0,
      class: 0,
      imageSmallURL: '',
      imageLargeURL: ''
    }
  }

  public createModifierItem = (): IProfileModifier => {
    return {
      communityItemId: '',
      imageLargeURL: '',
      name: '',
      description: '',
      appId: 0,
      type: 0,
      class: 0,
      title: '',
      profileColors: []
    }
  }

  public createProfileColors = (): IProfileStyle => {
    return {
      styleName: '',
      color: ''
    }
  }

  public calculateRecentPlayTime = (recentGames: IUserGameInfo[]): number => {
    let recentPlayTime = 0
    recentGames.forEach(game => {
      recentPlayTime += game.playtime2Weeks
    })
    return Math.ceil(recentPlayTime * 10) / 10
  }
}
