import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { Nameplate } from './nameplate'

describe('Nameplate', () => {
  let component: Nameplate
  let fixture: ComponentFixture<Nameplate>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nameplate]
    })
      .compileComponents()

    fixture = TestBed.createComponent(Nameplate)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
