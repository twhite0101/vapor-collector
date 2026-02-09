import type { OnInit } from '@angular/core'
import { Component, Input } from '@angular/core'
import type { ISteamLevelIcon } from '../../../../models/Steam'

@Component({
  selector: 'app-steam-level',
  imports: [],
  templateUrl: './steam-level.html',
  styleUrl: './steam-level.scss'
})
export class SteamLevel implements OnInit {
  @Input({ required: true }) public level: number
  @Input() public size = 32

  protected badge: ISteamLevelIcon

  protected steamLevelClass: string

  public ngOnInit (): void {
    this.badge = {
      level: this.level,
      size: this.size,
      fontSize: `${this.level < 100 ? this.size / 1.75 : this.size / 2.28}px`,
      height: `${this.size}px`,
      width: `${this.size}px`,
      lineHeight: `${this.level < 100 ? this.size - 2 : this.size}px`,
      backgroundSize: `${this.size}px`,
      backgroundPosition: `0 ${-this.size * Math.trunc((this.level % 100) / 10)}px`
    }

    if (this.level < 0) {
      console.error('The level must be greater than 0')
    }

    if (this.level > 6199) {
      console.error('The level must be less than 6199')
    }

    this.steamLevelClass = this.getLevelClass()
  }

  protected getLevelClass = (): string => {
    const lvl = Math.floor(this.badge.level / 100) * 100 || Math.floor(this.badge.level / 10) * 10
    const lvl_plus = Math.floor((this.badge.level - lvl) / 10) * 10

    if (lvl < 100) {
      return `lvl_${lvl}`
    }

    return `lvl_${lvl} lvl_plus_${lvl_plus}`
  }
}
