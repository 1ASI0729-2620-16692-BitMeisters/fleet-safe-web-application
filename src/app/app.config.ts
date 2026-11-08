import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { TitleStrategy, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { iamInterceptor } from './iam/infrastructure/iam.interceptor';
import { Notifier } from './shared/application/notifier';
import { readLanguagePreference } from './shared/infrastructure/i18n/language-preference';
import { languageInterceptor } from './shared/infrastructure/http/language.interceptor';
import { TranslatedTitleStrategy } from './shared/presentation/i18n/translated-title-strategy';
import { provideMaterialDefaults } from './shared/presentation/material/material-defaults';
import { SnackBarNotifier } from './shared/presentation/notifications/snack-bar-notifier';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([languageInterceptor, iamInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json',
        useHttpBackend: true,
      }),
      lang: readLanguagePreference(),
      fallbackLang: 'en-US',
    }),
    { provide: Notifier, useClass: SnackBarNotifier },
    provideMaterialDefaults(),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
  ],
};
