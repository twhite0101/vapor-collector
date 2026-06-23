import type { ApplicationConfig } from '@angular/core'
import { provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter } from '@angular/router'
import Aura from '@primeuix/themes/aura'

import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { providePrimeNG } from 'primeng/config'
import { routes } from './app.routes'
import { credentialInterceptor } from './interceptors/credential/credential-interceptor'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([credentialInterceptor])
    ),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
}
