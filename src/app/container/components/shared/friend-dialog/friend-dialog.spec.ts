import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { FriendDialog } from './friend-dialog'

describe('FriendDialog', () => {
  let component: FriendDialog
  let fixture: ComponentFixture<FriendDialog>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendDialog]
    })
      .compileComponents()

    fixture = TestBed.createComponent(FriendDialog)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
