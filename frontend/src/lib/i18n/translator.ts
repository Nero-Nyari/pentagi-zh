import type { Dictionary, TranslationKey, TranslationValues, Translator } from './types';

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Binds a dictionary to a `t()` function.
 *
 * Two conveniences beyond a raw lookup, both deliberately small:
 *
 *   - Interpolation — `{name}` in a template is replaced from `values`.
 *     Unknown names are left verbatim, so a mismatched placeholder shows up
 *     as `{name}` on screen instead of silently rendering `undefined`.
 *   - Plural selection — when `values.count` is a number and the dictionary
 *     carries a `<key>_one` sibling, that sibling wins for a count of exactly
 *     1. The base key doubles as the plural form, so a locale without plural
 *     rules (Chinese) only needs one entry. No CLDR machinery: this covers
 *     "1 file / 3 files" without pulling in a formatting library, and any
 *     string needing more than that should be reworded at the call site.
 */
export function createTranslator(dictionary: Dictionary): Translator {
    return (key, values) => {
        const template = dictionary[resolveKey(dictionary, key, values)];

        if (template === undefined) {
            // Reachable only through a stale key at runtime (e.g. a cached
            // bundle against a newer dictionary); the key itself is a far
            // better thing to show than an empty string.
            return key;
        }

        if (values === undefined) {
            return template;
        }

        return template.replaceAll(PLACEHOLDER, (match, name: string) => {
            const value = values[name];

            return value === undefined ? match : String(value);
        });
    };
}

/** Promotes `key` to its singular sibling when `values.count` calls for it. */
function resolveKey(dictionary: Dictionary, key: TranslationKey, values?: TranslationValues): TranslationKey {
    const count = values?.count;

    // Only a count of exactly 1 selects the singular. `0` and `'1'` must fall
    // through to the base key — English says "0 items", not "0 item".
    if (count !== 1) {
        return key;
    }

    const singular = `${key}_one` as TranslationKey;

    return singular in dictionary ? singular : key;
}
