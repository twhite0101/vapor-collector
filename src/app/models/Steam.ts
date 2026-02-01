export interface IUser {
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

export interface IStatus {
  lg: string;
}

export interface IUserRequestResponse {
  user: IUser;
}

export interface IUserGamesLibraryResponse {
  game_count: number;
  games: IUserGameInfo[];
}

export interface IUserGameInfo {
  appid: number;
  content_descriptorids: number[];
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
