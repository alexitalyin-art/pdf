export const i18n = {
  defaultLocale: 'en',
  locales: [
    'en', 'es', 'hi', 'pt', 'zh', 
    'fr', 'ar', 'de', 'ru', 'ur'
  ],
} as const;

export type Locale = (typeof i18n)['locales'][number];