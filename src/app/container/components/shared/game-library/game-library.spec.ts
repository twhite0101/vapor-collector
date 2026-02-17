import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { GameLibrary } from './game-library'

describe('GameLibrary', () => {
  let component: GameLibrary
  let fixture: ComponentFixture<GameLibrary>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameLibrary]
    })
      .compileComponents()

    fixture = TestBed.createComponent(GameLibrary)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
