import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { SteamLevel } from './steam-level'

describe('SteamLevel', () => {
  let component: SteamLevel
  let fixture: ComponentFixture<SteamLevel>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SteamLevel]
    })
      .compileComponents()

    fixture = TestBed.createComponent(SteamLevel)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
