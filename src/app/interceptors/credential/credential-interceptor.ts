import type { HttpInterceptorFn } from '@angular/common/http'

export const credentialInterceptor: HttpInterceptorFn = (req, next) => {
  const secureReq = req.clone({
    withCredentials: true
  })

  return next(secureReq)
}
