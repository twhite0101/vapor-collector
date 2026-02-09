import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { AppContainer } from './app-container'

describe('AppContainer', () => {
  let component: AppContainer
  let fixture: ComponentFixture<AppContainer>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppContainer]
    })
      .compileComponents()

    fixture = TestBed.createComponent(AppContainer)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
