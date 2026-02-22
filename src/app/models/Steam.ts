import type { SafeResourceUrl } from '@angular/platform-browser'

export interface ILoginResponse {
  response: ILoginResponseUser;
}

export interface ILoginResponseUser {
  provider: string;
  _json: {
    steamid: string;
    communityvisibilitystate: number;
    profilestate: number;
    personaname: string;
    commentpermission: number;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    avatarhash: string;
    lastlogoff: number;
    personastate: number;
    primaryclanid: string;
    timecreated: number;
    personastateflags: number;
    loccountrycode: string;
  };
  id: string;
  displayName: string;
  photos: [
    {
      value: string;
    },
    {
      value: string;
    },
    {
      value: string;
    }
  ];
  identifier: string;
}

export interface IUser {
  steamId: string;
  communityVisibilityState: number;
  profileState: number;
  personaName: string;
  commentPermission: number;
  profileUrl: string;
  avatars: {
    avatar: string;
    avatarMedium: string;
    avatarFull: string;
    avatarHash: string;
  };
  lastLogoff: string;
  playTime2Weeks?: number;
  personaState: number;
  status: string;
  primaryClanId: string;
  timeCreated: string;
  profileAgeYears: number;
  personaStateFlags: number;
  locCountryCode: string;
  displayName: string;
  badges: IBadge[];
  playerLevel: IPlayerLevel;
  gameLibrary: IUserGameInfo[];
  gameCount: number;
  friendList: ISteamFriend[];
  currentGameId?: string;
  gameServerIp?: string;
  currentGameName?: string;
}

export interface IUserFullResponse {
  user: ILoginResponseUser;
  additionalDetails: IFriendListDetailsResponseFriend[];
}

export interface IGetBadgesResponse {
  badges: IGetBadgesResponseArray[];
  player_xp: number;
  player_level: number;
  player_xp_needed_to_level_up: number;
  player_xp_needed_current_level: number;
}

export interface IPlayLevelPercentileResponse {
  player_level_percentile: number;
}

export interface IGetBadgesFullResponse {
  badges: IGetBadgesResponse;
  levelPercentile: IPlayLevelPercentileResponse;
}

export interface IGetBadgesResponseArray {
  badgeid: number;
  level: number;
  completion_time: number;
  xp: number;
  scarcity: number;
}

export interface IBadge {
  badgeId: number;
  level: number;
  completionTime: number;
  xp: number;
  scarcity: number;
}

export interface IPlayerLevel {
  playerXp: number;
  playerLevel: number;
  playerXpNeededToLevelUp: number;
  playerXpNeededCurrentLevel: number;
  levelPercentile: number;
}

export interface IStatus {
  lg: string;
}

export interface IUserRequestResponse {
  user: IUser;
}

export interface IUserGamesLibraryResponse {
  game_count: number;
  games: IUserGameInfoResponse[];
}

export interface IUserGameInfoResponse {
  appid: number;
  capsule_filename: string;
  content_descriptorids: number[];
  has_dlc: boolean;
  has_market: boolean;
  has_workshop: boolean;
  img_icon_url: string;
  name: string;
  playtime_2weeks: number;
  playtime_deck_forever: number;
  playtime_disconnected: number;
  playtime_forever: number;
  playtime_linux_forever: number;
  playtime_mac_forever: number;
  playtime_windows_forever: number;
  rtime_last_played: number;
  news?: INewsItemsResponse[];
}

export interface IUserGameInfo {
  appId: number;
  capsuleFilename: string;
  contentDescriptorIds: number[];
  hasDLC: boolean;
  hasMarket: boolean;
  hasWorkshop: boolean;
  imgIconUrl: string;
  name: string;
  playtime2Weeks: number;
  playtimeDeckForever: number;
  playtimeDisconnected: number;
  playtimeForever: number;
  playtimeLinuxForever: number;
  playtimeMacForever: number;
  playtimeWindowsForever: number;
  dateLastPlayed: Date;
  news?: INewsItems[];
  friendsWhoPlay?: ISteamFriend[];
  gameVersion?: number;
  achievements?: IAchievement[];
}

export interface ISteamLevelIcon {
  level: number;
  size?: number;
  fontSize: string;
  height: string;
  width: string;
  lineHeight: string;
  backgroundSize: string;
  backgroundPosition: string;
}

export interface IGetRecentlyPlayedGamesResponse {
  total_count: number;
  games: IGetRecentlyPlayedGamesResponseInfo[];
}

export interface IGetRecentlyPlayedGamesResponseInfo {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
  img_icon_url: string;
  playtime_windows_forever: number;
  playtime_mac_forever: number;
  playtime_linux_forever: number;
  playtime_deck_forever: number;
}

export interface IRecentlyPlayedGame {
  appId: number;
  name: string;
  playtime2Weeks: number;
  playtimeForever: number;
  imgIconUrl: string;
  playtimeWindowsForever: number;
  playtimeMacForever: number;
  playtimeLinuxForever: number;
  playtimeDeckForever: number;
  dateLastPlayed: Date;
}

export interface IFriendListResponseFriend {
  steamid: string;
  relationship: string;
  friend_since: number;
}

export interface IFriendListDetailsResponseFriend {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: number;
  realname: string;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
  loccountrycode: string;
  locstatecode: string;
  loccityid?: string;
  gameid?: string;
  gameserverip?: string;
  gameextrainfo?: string;
}

export interface IFriendListFullResponse {
  friendList: IFriendListResponseFriend[];
  details: IFriendListDetailsResponseFriend[];
  gameLibraries: IFriendGameResponse[];
}

export interface IFriendAvatars {
  avatar: string;
  avatarMedium: string;
  avatarFull: string;
  avatarHash: string;
}

export interface IFriendGameResponse {
  steamId: string;
  libraryResponse: IUserGamesLibraryResponse;
}

export interface ISteamFriend {
  steamId: string;
  relationship: string;
  friendSince: string;
  communityVisibilityState: string;
  profileState: number;
  displayName: string;
  profileUrl: string;
  avatars: IFriendAvatars;
  lastLogoff: string;
  personaState: number;
  realName: string;
  primaryClanId: string;
  timeCreated: number;
  personaStateFlags: number;
  locCountryCode: string;
  locStateCode: string;
  locCityId?: string;
  currentGameId?: string;
  gameServerIp?: string;
  currentGameName?: string;
  gameLibrary: IUserGameInfo[];
}

export interface IGetGameNewsResponse {
  appid: number;
  count: number;
  newsitems: INewsItemsResponse[];
}

export interface INewsItemsResponse {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  feed_type: number;
  appid: number;
}

export interface INewsItems {
  globalId: string;
  title: string;
  url: string;
  isExternalUrl: boolean;
  author: string;
  contents: string;
  feedLabel: string;
  date: Date;
  feedName: string;
  feedType: number;
  previewImg: string;
  videoLink: SafeResourceUrl;
}

export interface IGameDialogPassedData {
  game: IUserGameInfo;
  user: IUser;
}

export interface IGameDialogInfo {
  user: IUser;
  game: IUserGameInfo;
  news: INewsItems[];
  friendsWhoPlay: IFriendsWhoPlay[];
  concurrentPlayers: number;
  achievements: IAchievement[];
}

export interface IFriendsWhoPlay extends ISteamFriend {
  selectedGame: IUserGameInfo;
}

export interface IGameSchemaResponse {
  gameName: string;
  gameVersion: string;
  availableGameStats: IAchievementSchemaResponseFull;
}

export interface IAchievementSchemaResponseFull {
  achievements: IAchievementSchemaResponse[];
}

export interface IAchievementSchemaResponse {
  name: string;
  defaultvalue: number;
  displayName: string;
  hidden: number;
  description: string;
  icon: string;
  icongray: string;
}

export interface IAchievementSchema {
  name: string;
  defaultValue: number;
  displayName: string;
  hidden: number;
  description: string;
  icon: string;
  icongray: string;
}

export interface IUserAchievementsResponse {
  steamID: string;
  gameName: string;
  achievements: IUserAchievementsInfoResponse[];
}

export interface IUserAchievementsInfoResponse {
  apiname: string;
  achieved: number;
  unlocktime: number;
}

export interface IAchievement {
  name: string;
  achieved: boolean;
  displayName: string;
  hidden: boolean;
  description: string;
  icon: string;
  iconGray: string;
  unlockTime: Date;
}
