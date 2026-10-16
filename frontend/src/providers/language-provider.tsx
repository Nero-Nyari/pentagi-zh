import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import type { Language, Translator } from '@/lib/i18n/types';

import { detectLanguage } from '@/lib/i18n/detect';
import { dictionaries } from '@/lib/i18n/dictionaries';
import { setRuntimeLanguage } from '@/lib/i18n/runtime';
import { createTranslator } from '@/lib/i18n/translator';
import { getStorageItem, setStorageItem } from '@/lib/local-storage';

/** `localStorage` slot holding the visitor's explicit language choice. */
export const LANGUAGE_STORAGE_KEY = 'language';

const languageSchema = z.enum(['en', 'zh']);

export interface LanguageProviderState {
    language: Language;
    setLanguage: (language: Language) => void;
    t: Translator;
}

/**
 * Deliberately a working English translator rather than a throwing stub.
 *
 * `useTheme` throws without a provider because a missing theme is a real bug.
 * A missing language is not: any component rendered outside the provider —
 * a unit test mounting one component in isolation, a story, the error
 * boundary above the provider — should still render real copy instead of
 * crashing. English is the one dictionary every key is guaranteed to live in.
 */
const initialState: LanguageProviderState = {
    language: 'en',
    setLanguage: () => null,
    t: createTranslator(dictionaries.en),
};

export const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

interface LanguageProviderProps {
    children: React.ReactNode;
    /** Overrides browser detection when the visitor has no stored choice. */
    defaultLanguage?: Language;
    storageKey?: string;
}

export function LanguageProvider({
    children,
    defaultLanguage,
    storageKey = LANGUAGE_STORAGE_KEY,
}: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(
        () => getStorageItem(storageKey, languageSchema) ?? defaultLanguage ?? detectLanguage(),
    );

    // Keep `<html lang>` in step. Screen readers, hyphenation, and font
    // fallback all key off it, and it is what tells a browser "already
    // translated, do not offer to translate this page".
    //
    // The runtime translator rides along: it exists for the handful of
    // non-React modules (axios interceptors) that cannot use a hook, and this
    // is the only place that knows when the language changed.
    useEffect(() => {
        document.documentElement.lang = language;
        setRuntimeLanguage(language);
    }, [language]);

    const setLanguage = useCallback(
        (next: Language) => {
            setStorageItem(storageKey, next);
            setLanguageState(next);
        },
        [storageKey],
    );

    // Rebuilt only when the language changes, so `t` stays referentially
    // stable across re-renders and is safe to use in effect dependencies.
    const value = useMemo<LanguageProviderState>(
        () => ({ language, setLanguage, t: createTranslator(dictionaries[language]) }),
        [language, setLanguage],
    );

    return <LanguageProviderContext.Provider value={value}>{children}</LanguageProviderContext.Provider>;
}
