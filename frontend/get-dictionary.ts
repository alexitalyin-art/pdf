import 'server-only';
import type { Locale } from './i18n-config';

// We define the shape of our dictionaries for type safety
type Dictionary = {
    [key: string]: any;
};

// The new getDictionary function using a switch statement
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  switch (locale) {
    case 'en':
      return import('./dictionaries/en.json').then((module) => module.default);
    case 'es':
      return import('./dictionaries/es.json').then((module) => module.default);
    case 'hi':
      return import('./dictionaries/hi.json').then((module) => module.default);
    case 'pt':
      return import('./dictionaries/pt.json').then((module) => module.default);
    case 'zh':
      return import('./dictionaries/zh.json').then((module) => module.default);
    case 'fr':
      return import('./dictionaries/fr.json').then((module) => module.default);
    case 'ar':
      return import('./dictionaries/ar.json').then((module) => module.default);
    case 'de':
      return import('./dictionaries/de.json').then((module) => module.default);
    case 'ru':
      return import('./dictionaries/ru.json').then((module) => module.default);
    case 'ur':
      return import('./dictionaries/ur.json').then((module) => module.default);
    default:
      // Fallback to English if the locale is not found
      return import('./dictionaries/en.json').then((module) => module.default);
  }
};