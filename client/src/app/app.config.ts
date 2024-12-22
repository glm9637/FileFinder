import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngxs/store';
import { ConfigState } from './core/config/config.state';
import { ArticleState } from './state/article/article.state';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    provideStore([ConfigState, ArticleState], withNgxsRouterPlugin()),
  ],
};
