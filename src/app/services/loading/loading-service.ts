import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading = new BehaviorSubject<boolean>(false)

  public loading$ = this.loading.asObservable()

  public loadingOn = () => {
    this.loading.next(true)
  }

  public loadingOff = () => {
    this.loading.next(false)
  }
}
