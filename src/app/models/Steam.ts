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
  identifier: string;
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
  lastLogoff: number;
  personaState: number;
  primaryClanId: string;
  timeCreated: number;
  personaStateFlags: number;
  locCountryCode: string;
  displayName: string;
  badges: IBadge[];
  playerLevel: IPlayerLevel;
  gameLibrary: IUserGameInfo[];
  gameCount: number;
}

export interface IGetBadgesResponse {
  badges: IGetBadgesResponseArray[];
  player_xp: number;
  player_level: number;
  player_xp_needed_to_level_up: number;
  player_xp_needed_current_level: number;
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
  rTimeLastPlayed: number;
}
