import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { ValueDetails } from './value-details'

describe('ValueDetails', () => {
  let component: ValueDetails
  let fixture: ComponentFixture<ValueDetails>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValueDetails]
    })
      .compileComponents()

    fixture = TestBed.createComponent(ValueDetails)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
