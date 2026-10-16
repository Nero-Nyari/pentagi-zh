import { describe, expect, it } from 'vitest';

import type { Dictionary, TranslationKey, TranslationValues } from './types';

import { createTranslator } from './translator';

/**
 * `createTranslator` is typed against the shipped dictionary, so a fixture has
 * to be cast. Keeping the cast to this one expression is the point: loosening
 * the production signature to admit fixtures would trade a real guarantee
 * (every call site uses a key that exists) for a test convenience.
 */
const dictionary = {
    items: '{count} items',
    items_one: '{count} item',
    named: 'Hello, {name}!',
    plain: 'Plain',
    'stale.slot': 'Keeps {missing} verbatim',
} as unknown as Dictionary;

/**
 * Widens the key parameter back to `string` — casting the fixture to
 * `Dictionary` erased its own keys from the key union, so the literal keys
 * below would not typecheck against `Translator`.
 */
const t = (key: string, values?: TranslationValues) => createTranslator(dictionary)(key as TranslationKey, values);

describe('createTranslator', () => {
    it('returns the template for a plain key', () => {
        expect(t('plain')).toBe('Plain');
    });

    it('substitutes every placeholder from the values', () => {
        expect(t('named', { name: 'Ada' })).toBe('Hello, Ada!');
    });

    it('accepts numbers as placeholder values', () => {
        expect(t('named', { name: 42 })).toBe('Hello, 42!');
    });

    it('leaves a placeholder the values do not carry verbatim', () => {
        expect(t('stale.slot')).toBe('Keeps {missing} verbatim');
        expect(t('stale.slot', { other: 'x' })).toBe('Keeps {missing} verbatim');
    });

    it('ignores values the template never asks for', () => {
        expect(t('plain', { unused: 'x' })).toBe('Plain');
    });

    it('uses the singular sibling when count is 1', () => {
        expect(t('items', { count: 1 })).toBe('1 item');
    });

    it('uses the base key for any other count', () => {
        expect(t('items', { count: 0 })).toBe('0 items');
        expect(t('items', { count: 2 })).toBe('2 items');
    });

    it('falls back to the base key when a count is not a number', () => {
        expect(t('items', { count: 'many' })).toBe('many items');
    });

    it('falls back to the key itself when the dictionary lacks it', () => {
        expect(t('nope')).toBe('nope');
    });

    it('is independent of the dictionary it was built from', () => {
        const other = (key: string) =>
            createTranslator({ plain: 'Anders' } as unknown as Dictionary)(key as TranslationKey);

        expect(other('plain')).toBe('Anders');
        expect(t('plain')).toBe('Plain');
    });
});
