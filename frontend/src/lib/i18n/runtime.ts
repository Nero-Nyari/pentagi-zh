import type { Language, TranslationKey, TranslationValues } from './types';

import { dictionaries } from './dictionaries';
import { createTranslator } from './translator';

/**
 * Translator for code that runs outside React.
 *
 * `useTranslation` covers components, but a few modules run before any
 * provider exists and can never call a hook — the axios interceptors are the
 * only such case today (a 400 with no body still has to produce a message).
 * Those modules read through `runtimeT` instead.
 *
 * Starts on English so a module imported before React mounts — or in a test
 * that never mounts the provider — still produces real copy rather than a
 * raw key. `LanguageProvider` keeps it in step once it is on screen.
 */
let active = createTranslator(dictionaries.en);

/** Point the runtime translator at `language`. Called by `LanguageProvider`. */
export const setRuntimeLanguage = (language: Language): void => {
    active = createTranslator(dictionaries[language]);
};

/** Translate a key from outside React. See the note on `active` above. */
export const runtimeT = (key: TranslationKey, values?: TranslationValues): string => active(key, values);
