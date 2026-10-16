import { afterEach, describe, expect, it } from 'vitest';

import { detectLanguage, SUPPORTED_LANGUAGES } from './detect';

const originalLanguage = window.navigator.language;
const originalLanguages = window.navigator.languages;

/** jsdom exposes both as accessors on the prototype; redefine the own value. */
const stubNavigatorLanguages = (languages: string[], language = languages[0] ?? '') => {
    Object.defineProperty(window.navigator, 'languages', { configurable: true, value: languages });
    Object.defineProperty(window.navigator, 'language', { configurable: true, value: language });
};

afterEach(() => {
    Object.defineProperty(window.navigator, 'languages', { configurable: true, value: originalLanguages });
    Object.defineProperty(window.navigator, 'language', { configurable: true, value: originalLanguage });
});

describe('detectLanguage', () => {
    it.each([
        ['zh', 'zh'],
        ['zh-CN', 'zh'],
        ['zh-Hans', 'zh'],
        ['zh-TW', 'zh'],
        ['en', 'en'],
        ['en-GB', 'en'],
        ['EN-US', 'en'],
        ['ZH-HANS-CN', 'zh'],
    ])('maps the browser tag %s to %s', (tag, expected) => {
        stubNavigatorLanguages([tag]);

        expect(detectLanguage()).toBe(expected);
    });

    it('takes the first supported entry from the preference list, skipping unsupported ones', () => {
        stubNavigatorLanguages(['fr-FR', 'de', 'zh-CN', 'en']);

        expect(detectLanguage()).toBe('zh');
    });

    it('prefers an earlier English entry over a later Chinese one', () => {
        stubNavigatorLanguages(['en-US', 'zh-CN']);

        expect(detectLanguage()).toBe('en');
    });

    it('falls back to English when nothing matches', () => {
        stubNavigatorLanguages(['fr-FR', 'de-DE']);

        expect(detectLanguage()).toBe('en');
    });

    it('falls back to English when the preference list is empty', () => {
        stubNavigatorLanguages([]);

        expect(detectLanguage()).toBe('en');
    });

    it('ignores an empty primary subtag', () => {
        stubNavigatorLanguages(['-', 'zh']);

        expect(detectLanguage()).toBe('zh');
    });

    it('only ever returns a shipped language', () => {
        stubNavigatorLanguages(['pt-BR', 'ru', 'ja']);

        expect(SUPPORTED_LANGUAGES).toContain(detectLanguage());
    });
});
