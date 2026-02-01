import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { IUserGamesLibraryResponse } from '../../../models/Steam'

@Injectable({
  providedIn: 'root'
})
export class SteamService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)

  private apiUrl = 'http://localhost:3000'

  public getOwnedGames = async () => {
    const response = await firstValueFrom(this.http.get<IUserGamesLibraryResponse>(this.apiUrl + '/user/getGameLibrary', { withCredentials: true }))
    return response
  }
}
