import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { IGetBadgesResponse, IUserGamesLibraryResponse } from '../../../models/Steam'

@Injectable({
  providedIn: 'root'
})
export class SteamService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)

  private apiUrl = 'http://localhost:3000'

  public getOwnedGames = async () => {
    const response = await firstValueFrom(this.http.get<IUserGamesLibraryResponse>(this.apiUrl + '/user/getGameLibrary', { withCredentials: true }))
    const library = this.calculateHoursPlayed(response)
    return library
  }

  public getUserBadges = async () => {
    const response = await firstValueFrom(this.http.get<IGetBadgesResponse>(this.apiUrl + '/user/getUserBadges', { withCredentials: true }))
    return response
  }

  protected calculateHoursPlayed = (library: IUserGamesLibraryResponse): IUserGamesLibraryResponse => {
    library.games.forEach(game => {
      game.playtime_forever = isNaN(game.playtime_forever) ? 0 : Math.round(((game.playtime_forever / 60) + Number.EPSILON) * 100) / 100
      game.playtime_2weeks = isNaN(game.playtime_2weeks) ? 0 : Math.round(((game.playtime_2weeks / 60) + Number.EPSILON) * 100) / 100
      game.playtime_deck_forever = isNaN(game.playtime_deck_forever) ? 0 : Math.round(((game.playtime_deck_forever / 60) + Number.EPSILON) * 100) / 100
    })

    return library
  }
}
