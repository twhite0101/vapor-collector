import type { HttpInterceptorFn } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'

import { credentialInterceptor } from './credential-interceptor'

describe('credentialInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => credentialInterceptor(req, next))

  beforeEach(() => {
    TestBed.configureTestingModule({})
  })

  it('should be created', () => {
    expect(interceptor).toBeTruthy()
  })
})
