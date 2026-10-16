import type { Dictionary } from './dictionaries/en';

export type { Dictionary };

/**
 * Languages the UI ships translations for. Adding one means adding a
 * dictionary under `dictionaries/<code>/` and widening this union — the
 * `Record<Language, Dictionary>` in `dictionaries/index.ts` then fails to
 * compile until the new dictionary is wired in.
 */
export type Language = 'en' | 'zh';

/** Every valid translation key, derived from the English dictionary. */
export type TranslationKey = keyof Dictionary;

/** Values interpolated into a `{placeholder}` inside a translation template. */
export type TranslationValues = Record<string, number | string>;

/**
 * A dictionary already bound to a language. Call sites only ever see this —
 * they never pick a dictionary themselves.
 */
export type Translator = (key: TranslationKey, values?: TranslationValues) => string;
