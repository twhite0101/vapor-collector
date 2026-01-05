import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class SteamService {
  // Dependency Injections
  private readonly http: HttpClient = inject(HttpClient)
  private apiUrl = 'http://localhost:3000'

  public login = () => {
    // return this.http.get(this.apiUrl + '/auth/steam')
    window.location.href = 'http://localhost:3000/auth/steam'
  }
}
