import type { Language } from './types';

/**
 * Languages the UI ships translations for, in the order they are offered.
 * Kept in sync with {@link Language} — a mismatch shows up as a type error
 * here rather than as a missing entry at runtime.
 */
export const SUPPORTED_LANGUAGES = ['en', 'zh'] as const satisfies readonly Language[];

const isLanguage = (value: string): value is Language => (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

/**
 * Pick a starting language for a visitor who has never chosen one.
 *
 * Walks the browser's preference list in order and takes the first entry we
 * ship a translation for, comparing on the primary subtag only — so `zh-CN`,
 * `zh-Hans`, and `zh` all resolve to `zh`, and `en-GB` resolves to `en`.
 * Falls back to English, the dictionary every key is guaranteed to be in.
 */
export function detectLanguage(): Language {
    if (typeof navigator === 'undefined') {
        return 'en';
    }

    const preferred = [...(navigator.languages ?? []), navigator.language].filter(Boolean);

    for (const candidate of preferred) {
        const primary = candidate.toLowerCase().split('-')[0];

        if (primary && isLanguage(primary)) {
            return primary;
        }
    }

    return 'en';
}
