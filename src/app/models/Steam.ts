import type { SafeResourceUrl } from '@angular/platform-browser'

export interface ILoginResponse {
  response: ILoginResponseUser;
}

interface ILoginResponseUser {
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
  realName: string;
  commentPermission?: number;
  profileUrl: string;
  avatars: IAvatars;
  lastLogoff: string;
  playTime2Weeks?: number;
  personaState: number;
  status: string;
  primaryClanId: string;
  timeCreated: string;
  profileAgeYears: number;
  personaStateFlags: number;
  locCountryCode: string;
  locStateCode: string;
  locCityId?: string;
  displayName: string;
  badges?: IBadge[];
  playerLevel?: IPlayerLevel;
  gameLibrary: IUserGameInfo[];
  wishlist?: IWishlist[];
  accountValues?: IAccountValueDetails;
  gameCount: number;
  friendList?: ISteamFriend[];
  currentGameId?: string;
  gameServerIp?: string;
  currentGameName?: string;
  profileBackground: IProfileBackground;
}

export interface IUserFullResponse {
  user: ILoginResponseUser;
  additionalDetails: IUserAdditionalDetailsResponse[];
  wishlist: IWishlistResponseWithPrices[];
  background: IProfileBackgroundResponse;
}

export interface IGetBadgesResponseArray {
  badgeid: number;
  level: number;
  completion_time: number;
  xp: number;
  scarcity: number;
}

export interface IGetBadgesResponse {
  badges: IGetBadgesResponseArray[];
  player_xp: number;
  player_level: number;
  player_xp_needed_to_level_up: number;
  player_xp_needed_current_level: number;
}

export interface IGetBadgesFullResponse {
  badges: IGetBadgesResponse;
  levelPercentile: IPlayLevelPercentileResponse;
}

export interface IPlayLevelPercentileResponse {
  player_level_percentile: number;
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
  prices: IGamePriceOverviewResponse;
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
  dateLastPlayed: Date | string;
  news?: INewsItems[];
  friendsWhoPlay?: ISteamFriend[];
  gameVersion?: number;
  achievements?: IAchievement[];
  prices: IGamePrice;
  id?: string;
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

export interface IFriendListResponseFriend {
  steamid: string;
  relationship: string;
  friend_since: number;
}

export interface IUserAdditionalDetailsResponse {
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
  details: IUserAdditionalDetailsResponse[];
  gameLibraries: IFriendGameResponse[];
}

interface IAvatars {
  avatar: string;
  avatarMedium: string;
  avatarFull: string;
  avatarHash: string;
}

export interface IFriendGameResponse {
  steamId: string;
  libraryResponse: IUserGamesLibraryResponse;
}

export interface IFriendGameFullResponse extends IFriendGameResponse {
  appIds: string;
  index?: number;
}

export interface ISteamFriend extends IUser {
  relationship: string;
  friendSince: string;
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

interface IBaseDialogPassedData {
  user: IUser;
}

export interface IGameDialogPassedData extends IBaseDialogPassedData {
  game: IUserGameInfo;
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

interface IAchievementSchemaResponseFull {
  achievements: IAchievementSchemaResponse[];
}

interface IAchievementSchemaResponse {
  name: string;
  defaultvalue: number;
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

interface IUserAchievementsInfoResponse {
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

// Leaving Friend Achievement interfaces in for now, as I'd like
// to add it back in the future but currently all response are
// returning null so there is an issue with all of the authorized
// user's friends accounts showing as private within just this response
export interface IFriendAchievementSchemaResponse {
  schemas: IGameSchemaResponse[];
  achievementResponses: IUserAchievementsResponse[];
}

export interface ILibraryAchievements {
  appId: number;
  achievements: IAchievement[];
}

export interface IFriendDialogPassedData extends IBaseDialogPassedData {
  friend: ISteamFriend;
  friendUser: IUser;
  recentlyPlayedGames: IUserGameInfo[];
  recentPlayTime: number;
}

export interface IGamePriceResponseDetails {
  success: boolean;
  data: IGamePriceDataResponse;
}

interface IGamePriceDataResponse {
  price_overview: IGamePriceOverviewResponse;
}

export interface IGamePriceResponseFormat {
  appId: number;
  price_overview: IGamePriceOverviewResponse;
}

export interface IGamePriceOverviewResponse {
  currency: string;
  initial: number;
  final: number;
  discount_percent: number;
  initial_formatted: string;
  final_formatted: string;
}

export interface IGamePrice {
  currency: string;
  initial: number;
  final: number;
  discountPercent: number;
  initialFormatted: string;
  finalFormatted: string;
}

export interface IAccountValueDetails {
  totalEstLibraryValue: number;
  totalEstLibraryValueFormatted: string;
  currentEstLibraryValue: number;
  currentEstLibraryValueFormatted: string;
  averageCostPerGameTotal: number;
  averageCostPerGameTotalFormatted: string;
  averageCostPerGameCurrent: number;
  averageCostPerGameCurrentFormatted: string;
  averageValuePerHourTotal: number;
  averageValuePerHourTotalFormatted: string;
  averageValuePerHourCurrent: number;
  averageValuePerHourCurrentFormatted: string;
  totalEstLibraryFriendRank?: number;
  currentEstLibraryFriendRank?: number;
  averageCPGTotalFriendRank?: number;
  averageCPGCurrentFriendRank?: number;
  averageVPHTotalFriendRank?: number;
  averageVPHCurrentFriendRank?: number;
  totalEstLibraryWorldRank?: number;
  currentEstLibraryWorldRank?: number;
  averageCPGTotalWorldRank?: number;
  averageCPGCurrentWorldRank?: number;
  averageVPHTotalWorldRank?: number;
  averageVPHCurrentWorldRank?: number;
}

export interface IChartData {
  label: string;
  value: number;
  backgroundColor?: string;
}

export interface IWishlistResponse {
  appid: number;
  priority: number;
  date_added: number;
}

export interface IWishlistResponseWithPrices extends IWishlistResponse {
  priceCurrent: number;
  priceInitial: number;
  name: string;
}

export interface IWishlist {
  appId: number;
  name: string;
  priceCurrent: number;
  priceInitial: number;
  priority: number;
  dateAdded: string;
  storeUrl: string;
  id?: string;
}

export interface IGameNameResponse {
  appid: number;
  last_modified: number;
  name: string;
  price_change_number: number;
  __v: number;
  _id: string;
}

export interface IWishlistDialogPassedData extends IBaseDialogPassedData {
  style: string;
}

export interface IProfileBackgroundResponse {
  communityitemid: string;
  image_large: string;
  name: string;
  item_title: string;
  item_description: string;
  appid: number;
  item_type: number;
  item_class: number;
}

export interface IProfileBackground {
  communityItemId: string;
  imageURL: string;
  name: string;
  title: string;
  description: string;
  appId: number;
  type: number;
  class: number;
}
