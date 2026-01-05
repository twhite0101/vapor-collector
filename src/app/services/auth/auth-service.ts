import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from '../localStorage/local-storage-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Dependency Injections
  private readonly localStorage: LocalStorageService = inject(LocalStorageService)

  public setUser = (user: any) => {
    const checkUser = this.localStorage.getItem('user')
    if (!checkUser) {
      this.localStorage.setItem('user', user)
    }
  }
}
