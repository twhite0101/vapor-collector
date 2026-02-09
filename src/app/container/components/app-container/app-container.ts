import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Header } from '../shared/header/header'

@Component({
  selector: 'app-app-container',
  imports: [
    RouterOutlet,
    Header
  ],
  templateUrl: './app-container.html',
  styleUrl: './app-container.scss'
})
export class AppContainer {

}
