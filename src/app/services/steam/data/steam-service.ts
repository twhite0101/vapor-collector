import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import type { SafeResourceUrl } from '@angular/platform-browser'
import { DomSanitizer } from '@angular/platform-browser'
import type { Observable } from 'rxjs'
import { firstValueFrom, forkJoin, map } from 'rxjs'
import type { IAchievement, IFriendGameResponse, IFriendListDetailsResponseFriend, IFriendListFullResponse, IFriendListResponseFriend, IFriendsWhoPlay, IGameSchemaResponse, IGetBadgesFullResponse, IGetBadgesResponse, IGetGameNewsResponse, IGetRecentlyPlayedGamesResponse, INewsItems, INewsItemsResponse, IPlayLevelPercentileResponse, ISteamFriend, IUserAchievementsResponse, IUserGameInfo, IUserGameInfoResponse, IUserGamesLibraryResponse } from '../../../models/Steam'

const STEAM_IMAGE_CLAN = 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans'
const YT_WATCH_LINK = 'https://www.youtube.com/embed/'
const VIDEO_ID_REGEX = /\[previewyoutube=(.{11});full\]\[\/previewyoutube\]/
const IMG_SRC_REGEX = /img src=["'](.*?)["']/
const IMG_REGEX = /\[img\](.*?)\[\/img\]/

@Injectable({
  providedIn: 'root'
})
export class SteamService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)
  private readonly domSanitizer: DomSanitizer = inject(DomSanitizer)

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

  public initializeFriendList = async () => {
    const friendList = await this.getFriendList()

    const steamIds = friendList.map(friend => {
      return friend.steamid
    })

    const friendListGames$: Observable<IUserGamesLibraryResponse>[] = steamIds.map(id => this.http.get<IUserGamesLibraryResponse>(this.apiUrl + `/user/getGameLibrary?steamId=${id}`, { withCredentials: true }))

    const friendListGamesResponse = await firstValueFrom(forkJoin(friendListGames$)
      .pipe(
        map(result => {
          return result.map((library, i) => {
            const friendGameResponse: IFriendGameResponse = {
              libraryResponse: library,
              steamId: steamIds[i]
            }
            return friendGameResponse
          })
        })
      ))

    const friendListDetails = await this.getFriendListDetails(steamIds)

    const friendListFull: IFriendListFullResponse = {
      friendList: friendList,
      details: friendListDetails,
      gameLibraries: friendListGamesResponse
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

  protected calculateGameLibraryHoursPlayed = (library: IUserGamesLibraryResponse): IUserGamesLibraryResponse => {
    library.games.forEach(game => {
      game.playtime_forever = isNaN(game.playtime_forever) ? 0 : Math.round(((game.playtime_forever / 60) + Number.EPSILON) * 100) / 100
      game.playtime_2weeks = isNaN(game.playtime_2weeks) ? 0 : Math.round(((game.playtime_2weeks / 60) + Number.EPSILON) * 100) / 100
      game.playtime_deck_forever = isNaN(game.playtime_deck_forever) ? 0 : Math.round(((game.playtime_deck_forever / 60) + Number.EPSILON) * 100) / 100
      game.playtime_disconnected = isNaN(game.playtime_disconnected) ? 0 : Math.round(((game.playtime_disconnected / 60) + Number.EPSILON) * 100) / 100
      game.playtime_linux_forever = isNaN(game.playtime_linux_forever) ? 0 : Math.round(((game.playtime_linux_forever / 60) + Number.EPSILON) * 100) / 100
      game.playtime_mac_forever = isNaN(game.playtime_mac_forever) ? 0 : Math.round(((game.playtime_mac_forever / 60) + Number.EPSILON) * 100) / 100
      game.playtime_windows_forever = isNaN(game.playtime_windows_forever) ? 0 : Math.round(((game.playtime_windows_forever / 60) + Number.EPSILON) * 100) / 100
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

  public mapGameNewsResponse = (newsResponse: INewsItemsResponse[]): INewsItems[] => {
    if (newsResponse === undefined) {
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
        feedType: 0,
        previewImg: '',
        videoLink: ''
      }]
      return noNews
    }
    const newsItems: INewsItems[] = newsResponse.map(news => {
      return {
        globalId: news.gid,
        title: news.title,
        url: news.url,
        isExternalUrl: news.is_external_url,
        author: news.author,
        contents: news.contents,
        feedLabel: news.feedlabel,
        date: new Date(news.date * 1000),
        feedName: news.feedname.includes('steam') ? 'Steam' : news.feedname,
        feedType: news.feed_type,
        previewImg: this.parseNewsPreviewImg(news.contents),
        videoLink: this.parseNewsVideoLink(news.contents)
      }
    })
    return newsItems
  }

  public mapUserAchievements = (gameSchema: IGameSchemaResponse, userAchievements: IUserAchievementsResponse): IAchievement[] => {
    const mappedAchievements: IAchievement[] = []
    userAchievements.achievements.forEach(achievement => {
      const matchingAchievement = gameSchema.availableGameStats.achievements.find(achievementSchema => achievement.apiname === achievementSchema.name)
      if (!matchingAchievement) {
        mappedAchievements.push({
          name: '',
          achieved: false,
          displayName: '',
          hidden: true,
          description: '',
          icon: '',
          iconGray: '',
          unlockTime: new Date()
        })
      }
      else {
        mappedAchievements.push({
          name: matchingAchievement.name,
          achieved: achievement.achieved === 1 ? true : false,
          displayName: matchingAchievement.displayName,
          hidden: matchingAchievement.hidden === 1 ? true : false,
          description: matchingAchievement.hidden === 0 ? matchingAchievement.description : 'Description is hidden',
          icon: matchingAchievement.icon,
          iconGray: matchingAchievement.icongray,
          unlockTime: new Date(achievement.unlocktime * 1000)
        })
      }
    })
    return mappedAchievements
  }

  private parseNewsPreviewImg = (content: string): string => {
    if (content.includes('img src')) {
      const matchSrcImg = content.match(IMG_SRC_REGEX)
      if (matchSrcImg !== null) {
        if (matchSrcImg[1].includes('{STEAM_CLAN_IMAGE}')) {
          const formattedClanImgUrl = matchSrcImg[1].replace('{STEAM_CLAN_IMAGE}', STEAM_IMAGE_CLAN)
          return formattedClanImgUrl
        }
        else if (matchSrcImg[1].includes('data:image')) {
          return 'assets/steam_news_fb.png'
        }
        return matchSrcImg[1]
      }
      else {
        return 'assets/steam_news_fb.png'
      }
    }
    else if (content.includes('img')) {
      const matchImg = content.match(IMG_REGEX)
      if (matchImg !== null) {
        if (matchImg[1].includes('{STEAM_CLAN_IMAGE}')) {
          const formattedClanImgUrl = matchImg[1].replace('{STEAM_CLAN_IMAGE}', STEAM_IMAGE_CLAN)
          return formattedClanImgUrl
        }
        return matchImg[1]
      }
      else {
        return 'assets/steam_news_fb.png'
      }
    }
    else {
      return 'assets/steam_news_fb.png'
    }
  }

  private parseNewsVideoLink = (content: string): SafeResourceUrl => {
    if (content.includes('previewyoutube')) {
      const matchSrcImg = content.match(VIDEO_ID_REGEX)
      if (matchSrcImg !== null) {
        const formattedVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(YT_WATCH_LINK + matchSrcImg[1])
        return formattedVideoUrl
      }
      else {
        return ''
      }
    }
    else {
      return ''
    }
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
        dateLastPlayed: new Date(response.rtime_last_played * 1000)
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
        dateLastPlayed: new Date()
      }
    }
  }
}
