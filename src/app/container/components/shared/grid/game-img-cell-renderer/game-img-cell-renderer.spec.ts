import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { GameImgCellRenderer } from './game-img-cell-renderer'

describe('GameImgCellRenderer', () => {
  let component: GameImgCellRenderer
  let fixture: ComponentFixture<GameImgCellRenderer>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameImgCellRenderer]
    })
      .compileComponents()

    fixture = TestBed.createComponent(GameImgCellRenderer)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
