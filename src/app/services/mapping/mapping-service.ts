import { inject, Injectable } from '@angular/core'
import type { SafeResourceUrl } from '@angular/platform-browser'
import { DomSanitizer } from '@angular/platform-browser'
import type { IAccountValueDetails, IAchievement, IBadge, IChartData, IFriendGameResponse, IFriendListFullResponse, IGameSchemaResponse, IGetBadgesFullResponse, IGetBadgesResponseArray, INewsItems, INewsItemsResponse, IProfileItems, IProfileItemsResponse, IProfileStyle, IProfileStyleResponse, ISteamFriend, IUser, IUserAchievementsResponse, IUserFullResponse, IUserGameInfo, IUserGameInfoResponse, IUserGamesLibraryResponse, IWishlist, IWishlistResponseWithPrices } from '../../models/Steam'
import { SteamService } from '../steam/data/steam-service'
import { UtilsService } from '../utils/utils-service'

const STEAM_IMAGE_CLAN = 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans'
const YT_WATCH_LINK = 'https://www.youtube.com/embed/'
const VIDEO_ID_REGEX = /\[previewyoutube=(.{11});full\]\[\/previewyoutube\]/
const IMG_SRC_REGEX = /img src=["'](.*?)["']/
const IMG_REGEX = /\[img\](.*?)\[\/img\]/
const PROFILE_ITEM_URL = 'https://shared.fastly.steamstatic.com/community_assets/images/'

@Injectable({
  providedIn: 'root'
})
export class MappingService {
  // Dependency Injections
  private readonly utilsService: UtilsService = inject(UtilsService)
  private readonly steamService: SteamService = inject(SteamService)
  private readonly domSanitizer: DomSanitizer = inject(DomSanitizer)

  public mapAuthResponseToUser = (userFull: IUserFullResponse, library: IUserGamesLibraryResponse, badgesFull: IGetBadgesFullResponse, friendList: IFriendListFullResponse): IUser => {
    const returnedUser: IUser = {
      steamId: userFull.user._json.steamid,
      communityVisibilityState: userFull.user._json.communityvisibilitystate,
      profileState: userFull.user._json.profilestate,
      realName: userFull.additionalDetails[0].realname,
      commentPermission: userFull.user._json.commentpermission,
      profileUrl: userFull.user._json.profileurl,
      avatars: {
        avatar: userFull.user._json.avatar,
        avatarMedium: userFull.user._json.avatarmedium,
        avatarFull: userFull.user._json.avatarfull,
        avatarHash: userFull.user._json.avatarhash
      },
      lastLogoff: this.utilsService.convertUnixTimeToCurrentTime(userFull.user._json.lastlogoff),
      personaState: userFull.user._json.personastate,
      status: this.setUserStatus(userFull.user._json.personastate),
      primaryClanId: userFull.user._json.primaryclanid,
      timeCreated: this.utilsService.convertUnixTimeToCurrentTime(userFull.user._json.timecreated),
      profileAgeYears: this.calculateProfileAgeYears(userFull.user._json.timecreated),
      personaStateFlags: userFull.user._json.personastateflags,
      locStateCode: userFull.additionalDetails[0].locstatecode,
      locCityId: userFull.additionalDetails[0].loccityid !== undefined ? userFull.additionalDetails[0].loccityid : '',
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
      wishlist: this.mapWishlist(userFull.wishlist, library.games),
      gameCount: library.game_count,
      currentGameId: userFull.additionalDetails[0].gameid !== undefined ? userFull.additionalDetails[0].gameid: '',
      gameServerIp: userFull.additionalDetails[0].gameserverip !== undefined ? userFull.additionalDetails[0].gameserverip : '',
      currentGameName: userFull.additionalDetails[0].gameextrainfo !== undefined ? userFull.additionalDetails[0].gameextrainfo : '',
      profileItems: this.mapProfileItems(userFull.profileItems)
    }

    return returnedUser
  }

  public mapBadgesResponse = (responses: IGetBadgesResponseArray[]): IBadge[] => {
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

  public mapGameLibraryResponse = (responses: IUserGameInfoResponse[], isAuthUser: boolean): IUserGameInfo[] => {
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
        playtime2Weeks: isAuthUser ? response.playtime_2weeks : this.utilsService.formatFriendPlayTime(response.playtime_2weeks),
        playtimeDeckForever: isAuthUser ? response.playtime_deck_forever : this.utilsService.formatFriendPlayTime(response.playtime_deck_forever),
        playtimeDisconnected: isAuthUser ? response.playtime_disconnected : this.utilsService.formatFriendPlayTime(response.playtime_disconnected),
        playtimeForever: isAuthUser ? response.playtime_forever : this.utilsService.formatFriendPlayTime(response.playtime_forever),
        playtimeLinuxForever: isAuthUser ? response.playtime_linux_forever : this.utilsService.formatFriendPlayTime(response.playtime_linux_forever),
        playtimeMacForever: isAuthUser ? response.playtime_mac_forever : this.utilsService.formatFriendPlayTime(response.playtime_mac_forever),
        playtimeWindowsForever: isAuthUser ? response.playtime_windows_forever : this.utilsService.formatFriendPlayTime(response.playtime_windows_forever),
        dateLastPlayed: new Date(response.rtime_last_played * 1000),
        prices: !response.prices ? this.steamService.createNewGameInfoPrice() : {
          currency: response.prices.currency,
          initial: response.prices.initial / 100,
          final: response.prices.final / 100,
          discountPercent: response.prices.discount_percent,
          initialFormatted: response.prices.initial_formatted,
          finalFormatted: response.prices.final_formatted
        }
      }
    })
    return games
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

  private mapFriendListResponse = (responses: IFriendListFullResponse): ISteamFriend[] => {
    const friends: ISteamFriend[] = responses.friendList.map((response, i) => {
      const matchingDetails = responses.details.find(detail => detail.steamid === response.steamid)
      if (matchingDetails === undefined) {
        return {
          steamId: '',
          relationship: '',
          friendSince: '',
          communityVisibilityState: 0,
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
          timeCreated: '',
          personaStateFlags: 0,
          locCountryCode: '',
          locStateCode: '',
          gameLibrary: [],
          status: '',
          profileAgeYears: 0,
          locCityId: '',
          currentGameId: '',
          gameServerIp: '',
          currentGameName: '',
          gameCount: 0,
          profileItems: this.steamService.createProfileItems()
        }
      }
      else {
        return {
          steamId: response.steamid,
          relationship: response.relationship,
          friendSince: response.friend_since ? this.utilsService.convertUnixTimeToCurrentTime(response.friend_since) : '',
          communityVisibilityState: matchingDetails?.communityvisibilitystate,
          profileState: matchingDetails?.profilestate,
          displayName: matchingDetails?.personaname,
          profileUrl: matchingDetails?.profileurl,
          avatars: {
            avatar: matchingDetails?.avatar,
            avatarMedium: matchingDetails?.avatarmedium,
            avatarFull: matchingDetails?.avatarfull,
            avatarHash: matchingDetails?.avatarhash
          },
          lastLogoff: matchingDetails?.lastlogoff ? this.utilsService.convertUnixTimeToCurrentTime(matchingDetails?.lastlogoff) : '',
          personaState: matchingDetails?.personastate,
          status: this.setUserStatus(matchingDetails.personastate),
          realName: matchingDetails?.realname,
          primaryClanId: matchingDetails?.primaryclanid,
          timeCreated: matchingDetails?.timecreated ? this.utilsService.convertUnixTimeToCurrentTime(matchingDetails?.timecreated) : '',
          profileAgeYears: this.calculateProfileAgeYears(matchingDetails.timecreated),
          personaStateFlags: matchingDetails?.personastateflags,
          locCountryCode: matchingDetails?.loccountrycode,
          locStateCode: matchingDetails?.locstatecode,
          locCityId: matchingDetails?.loccityid !== undefined ? matchingDetails?.loccityid : '',
          currentGameId: matchingDetails?.gameid !== undefined ? matchingDetails?.gameid : '',
          gameServerIp: matchingDetails?.gameserverip !== undefined ? matchingDetails?.gameserverip : '',
          currentGameName: matchingDetails?.gameextrainfo !== undefined ? matchingDetails?.gameextrainfo : '',
          gameLibrary: this.findFriendGameLibrary(Number(response.steamid), responses.gameLibraries),
          gameCount: responses.gameLibraries[i].libraryResponse.game_count,
          profileItems: responses.profileItems[i] === null ? this.steamService.createProfileItems() : this.mapProfileItems(responses.profileItems[i])
        }
      }
    })
    return friends
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

  public calculateAccountValueDetails = (responses: IUserGameInfoResponse[] | IUserGameInfo[]): IAccountValueDetails => {
    const totalAccountString = responses.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.prices.initial
    }, 0).toFixed(2)

    const currentAccountString = responses.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.prices.final
    }, 0).toFixed(2)

    let totalHoursString = ''
    if (Object.keys(responses[0]).some(response => response === 'playtime_forever')) {
      totalHoursString = responses.reduce((accumulator, currentValue) => {
        return accumulator + (currentValue as IUserGameInfoResponse).playtime_forever
      }, 0).toFixed(2)
    }
    else {
      totalHoursString = responses.reduce((accumulator, currentValue) => {
        return accumulator + (currentValue as IUserGameInfo).playtimeForever
      }, 0).toFixed(2)
    }
    const totalAccountNum = parseFloat(totalAccountString)
    const currentAccountNum = parseFloat(currentAccountString)
    const totalHoursNum = parseFloat(totalHoursString)

    return {
      totalEstLibraryValue: totalAccountNum,
      totalEstLibraryValueFormatted: this.utilsService.formatMonetaryAmount(totalAccountNum),
      currentEstLibraryValue: currentAccountNum,
      currentEstLibraryValueFormatted: this.utilsService.formatMonetaryAmount(currentAccountNum),
      averageCostPerGameTotal: parseFloat((totalAccountNum / responses.length).toFixed(2)),
      averageCostPerGameTotalFormatted: this.utilsService.formatMonetaryAmount(parseFloat((totalAccountNum / responses.length).toFixed(2))),
      averageCostPerGameCurrent: parseFloat((currentAccountNum / responses.length).toFixed(2)),
      averageCostPerGameCurrentFormatted: this.utilsService.formatMonetaryAmount(parseFloat((currentAccountNum / responses.length).toFixed(2))),
      averageValuePerHourTotal: parseFloat((totalAccountNum / totalHoursNum).toFixed(2)),
      averageValuePerHourTotalFormatted: this.utilsService.formatMonetaryAmount(parseFloat((totalAccountNum / totalHoursNum).toFixed(2))),
      averageValuePerHourCurrent: parseFloat((currentAccountNum / totalHoursNum).toFixed(2)),
      averageValuePerHourCurrentFormatted: this.utilsService.formatMonetaryAmount(parseFloat((currentAccountNum / totalHoursNum).toFixed(2)))
    }
  }

  public calculateAccountRankings = (user: IUser) => {
    const userAccountDetails = (user.friendList as ISteamFriend[]).map(friend => {
      return {
        steamId: friend.steamId,
        accountValues: friend.accountValues
      }
    })
    userAccountDetails.push({
      steamId: user.steamId,
      accountValues: user.accountValues
    })

    const totalLibrarySort = [...userAccountDetails]
    totalLibrarySort.sort((userA, userB) => {
      return (userB.accountValues as IAccountValueDetails).totalEstLibraryValue - (userA.accountValues as IAccountValueDetails).totalEstLibraryValue
    })

    const currentLibrarySort = [...userAccountDetails]
    currentLibrarySort.sort((userA, userB) => {
      return (userB.accountValues as IAccountValueDetails).currentEstLibraryValue - (userA.accountValues as IAccountValueDetails).currentEstLibraryValue
    })

    const averageCPGTotalSort = [...userAccountDetails]
    averageCPGTotalSort.sort((userA, userB) => {
      return (userB.accountValues as IAccountValueDetails).averageCostPerGameTotal - (userA.accountValues as IAccountValueDetails).averageCostPerGameTotal
    })

    const averageCPGCurrentSort = [...userAccountDetails]
    averageCPGCurrentSort.sort((userA, userB) => {
      return (userB.accountValues as IAccountValueDetails).averageCostPerGameCurrent - (userA.accountValues as IAccountValueDetails).averageCostPerGameCurrent
    })

    const averageVPHTotalSort = [...userAccountDetails]
    averageVPHTotalSort.sort((userA, userB) => {
      return (userB.accountValues as IAccountValueDetails).averageValuePerHourTotal - (userA.accountValues as IAccountValueDetails).averageValuePerHourTotal
    })

    const averageVPHCurrentSort = [...userAccountDetails]
    averageVPHCurrentSort.sort((userA, userB) => {
      return (userB.accountValues as IAccountValueDetails).averageValuePerHourCurrent - (userA.accountValues as IAccountValueDetails).averageValuePerHourCurrent
    });

    (user.accountValues as IAccountValueDetails).totalEstLibraryFriendRank = totalLibrarySort.findIndex(account => account.steamId === user.steamId) + 1;
    (user.accountValues as IAccountValueDetails).currentEstLibraryFriendRank = currentLibrarySort.findIndex(account => account.steamId === user.steamId) + 1;
    (user.accountValues as IAccountValueDetails).averageCPGTotalFriendRank = averageCPGTotalSort.findIndex(account => account.steamId === user.steamId) + 1;
    (user.accountValues as IAccountValueDetails).averageCPGCurrentFriendRank = averageCPGCurrentSort.findIndex(account => account.steamId === user.steamId) + 1;
    (user.accountValues as IAccountValueDetails).averageVPHTotalFriendRank = averageVPHTotalSort.findIndex(account => account.steamId === user.steamId) + 1;
    (user.accountValues as IAccountValueDetails).averageVPHCurrentFriendRank = averageVPHCurrentSort.findIndex(account => account.steamId === user.steamId) + 1;

    (user.friendList as ISteamFriend[]).forEach(friend => {
      (friend.accountValues as IAccountValueDetails).totalEstLibraryFriendRank = totalLibrarySort.findIndex(account => account.steamId === friend.steamId) + 1;
      (friend.accountValues as IAccountValueDetails).currentEstLibraryFriendRank = currentLibrarySort.findIndex(account => account.steamId === friend.steamId) + 1;
      (friend.accountValues as IAccountValueDetails).averageCPGTotalFriendRank = averageCPGTotalSort.findIndex(account => account.steamId === friend.steamId) + 1;
      (friend.accountValues as IAccountValueDetails).averageCPGCurrentFriendRank = averageCPGCurrentSort.findIndex(account => account.steamId === friend.steamId) + 1;
      (friend.accountValues as IAccountValueDetails).averageVPHTotalFriendRank = averageVPHTotalSort.findIndex(account => account.steamId === friend.steamId) + 1;
      (friend.accountValues as IAccountValueDetails).averageVPHCurrentFriendRank = averageVPHCurrentSort.findIndex(account => account.steamId === friend.steamId) + 1
    })
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

  public mapMostValuableGames = (user: IUser): IChartData[] => {
    const nonFreeGames = user.gameLibrary.filter(game => game.prices.initial !== 0 && game.playtimeForever > 0)
    return nonFreeGames.map(game => {
      return {
        label: game.name,
        value: parseFloat((game.prices.initial / game.playtimeForever).toFixed(2))
      }
    })
  }

  public mapWishlist = (wishlist: IWishlistResponseWithPrices[], library: IUserGameInfoResponse[]): IWishlist[] => {
    const wishlistFormatted: IWishlist[] = wishlist.map(game => {
      library.forEach((libGame, i) => {
        if (libGame.appid !== game.appid) {
          return
        }
        return i
      })
      return {
        appId: game.appid,
        priority: game.priority,
        dateAdded: new Date(game.date_added * 1000).toISOString().slice(0, new Date(game.date_added * 1000).toISOString().indexOf('T')),
        priceCurrent: game.priceCurrent / 100,
        priceInitial: game.priceInitial / 100,
        name: game.name,
        storeUrl: `https://store.steampowered.com/app/${game.appid}`
      }
    })
    return wishlistFormatted
  }

  private mapProfileItems = (response: IProfileItemsResponse): IProfileItems => {
    const items: IProfileItems = {
      background: Object.entries(response.profile_background).length === 0 ? this.steamService.createBackgroundItem() : {
        communityItemId: response.profile_background.communityitemid,
        imageLargeURL: PROFILE_ITEM_URL + response.profile_background.image_large,
        name: response.profile_background.name,
        description: response.profile_background.item_description,
        appId: response.profile_background.appid,
        type: response.profile_background.item_type,
        class: response.profile_background.item_class,
        movieWebmURL: PROFILE_ITEM_URL + response.profile_background.movie_webm,
        movieMP4URL: PROFILE_ITEM_URL + response.profile_background.movie_mp4,
        movieWebmSmallURL: PROFILE_ITEM_URL + response.profile_background.movie_webm_small,
        movieMP4SmallURL: PROFILE_ITEM_URL + response.profile_background.movie_mp4_small,
        equipped: response.profile_background.equipped_flags !== undefined ? response.profile_background.equipped_flags === 1 ? true : false : false
      },
      avatarFrame: Object.entries(response.avatar_frame).length === 0 ? this.steamService.createAvatarItem() : {
        communityItemId: response.avatar_frame.communityitemid,
        name: response.avatar_frame.name,
        description: response.avatar_frame.item_description,
        appId: response.avatar_frame.appid,
        type: response.avatar_frame.item_type,
        class: response.avatar_frame.item_class,
        imageSmallURL: PROFILE_ITEM_URL + response.avatar_frame.image_small,
        imageLargeURL: PROFILE_ITEM_URL + response.avatar_frame.image_large
      },
      animatedAvatar: Object.entries(response.animated_avatar).length === 0 ? this.steamService.createAvatarItem() : {
        communityItemId: response.animated_avatar.communityitemid,
        name: response.animated_avatar.name,
        description: response.animated_avatar.item_description,
        appId: response.animated_avatar.appid,
        type: response.animated_avatar.item_type,
        class: response.animated_avatar.item_class,
        imageSmallURL: PROFILE_ITEM_URL + response.animated_avatar.image_small,
        imageLargeURL: PROFILE_ITEM_URL + response.animated_avatar.image_large
      },
      profileModifier: Object.entries(response.profile_modifier).length === 0 ? this.steamService.createModifierItem() : {
        communityItemId: response.profile_modifier.communityitemid,
        imageLargeURL: PROFILE_ITEM_URL + response.profile_modifier.image_large,
        name: response.profile_modifier.name,
        description: response.profile_modifier.item_description,
        appId: response.profile_modifier.appid,
        type: response.profile_modifier.item_type,
        class: response.profile_modifier.item_class,
        title: response.profile_modifier.item_title,
        profileColors: this.mapProfileColors(response.profile_modifier.profile_colors)
      }
    }

    return items
  }

  private mapProfileColors = (response: IProfileStyleResponse | IProfileStyleResponse[]): IProfileStyle | IProfileStyle[] => {
    if (response === null || response === undefined) {
      return this.steamService.createProfileColors()
    }

    if (Array.isArray(response)) {
      return response.map(profileColor => {
        return {
          styleName: profileColor.style_name,
          color: profileColor.color
        }
      })
    }

    if (Object.entries(response).length > 0) {
      return {
        styleName: response.style_name,
        color: response.color
      }
    }

    return this.steamService.createProfileColors()
  }
}
