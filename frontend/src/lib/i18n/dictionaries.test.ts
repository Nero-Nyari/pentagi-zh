import { describe, expect, it } from 'vitest';

import { SUPPORTED_LANGUAGES } from './detect';
import { dictionaries } from './dictionaries';

/** `{name}`-style slots a template asks the caller to fill. */
const placeholdersOf = (template: string): string[] =>
    [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '').sort();

const entriesOf = (language: (typeof SUPPORTED_LANGUAGES)[number]) =>
    Object.entries(dictionaries[language]) as [string, string][];

/**
 * Invariants the dictionaries have to keep with each other. These are the
 * checks the type system cannot make on its own: `satisfies Dictionary` in
 * `zh/index.ts` catches a *missing* key, but nothing but a test catches an
 * empty translation, a dropped `{count}`, or a typo'd key that happens to
 * leave the real one absent-but-unnoticed across a namespace boundary.
 */
describe('dictionaries', () => {
    it('ships a dictionary for every supported language', () => {
        expect(Object.keys(dictionaries).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
    });

    it.each(SUPPORTED_LANGUAGES)('%s carries exactly the English key set', (language) => {
        const expected = Object.keys(dictionaries.en).sort();
        const actual = entriesOf(language)
            .map(([key]) => key)
            .sort();

        expect(actual).toEqual(expected);
    });

    it.each(SUPPORTED_LANGUAGES)('%s has no blank translation', (language) => {
        const blanks = entriesOf(language)
            .filter(([, value]) => value.trim() === '')
            .map(([key]) => key);

        expect(blanks).toEqual([]);
    });

    it.each(SUPPORTED_LANGUAGES)('%s keeps every placeholder the English copy uses', (language) => {
        const english = new Map(entriesOf('en'));
        const mismatched = entriesOf(language)
            .filter(([key, value]) => {
                const source = english.get(key);

                return source !== undefined && placeholdersOf(value).join() !== placeholdersOf(source).join();
            })
            .map(([key]) => key);

        // A dropped `{count}` renders as "3 " instead of "3 items"; a stray one
        // renders a literal `{count}`. Both are caught here rather than by a
        // user staring at a broken string.
        expect(mismatched).toEqual([]);
    });
});
