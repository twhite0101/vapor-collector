import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { FriendList } from './friend-list'

describe('FriendsList', () => {
  let component: FriendList
  let fixture: ComponentFixture<FriendList>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendList]
    })
      .compileComponents()

    fixture = TestBed.createComponent(FriendList)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
