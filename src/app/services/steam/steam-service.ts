import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class SteamService {
  private apiUrl = 'http://localhost:3000'

  public login = () => {
    window.location.href = this.apiUrl + '/auth/steam'
  }

  public logout = () => {
    window.location.href = this.apiUrl + '/logout'
  }
}
