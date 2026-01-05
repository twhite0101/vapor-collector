import { Component, inject, OnInit } from '@angular/core';
import { LocalStorageService } from '../../services/localStorage/local-storage-service';
import { IUser } from '../../models/Steam';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  // Dependency Injections
  private readonly localStorage: LocalStorageService = inject(LocalStorageService)
  protected user: IUser
  protected name: string

  public ngOnInit(): void {
    this.user = this.localStorage.getItem('user')
  }
}
