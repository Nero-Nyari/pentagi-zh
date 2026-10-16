import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useTranslation } from '@/hooks/use-translation';

import { LANGUAGE_STORAGE_KEY, LanguageProvider } from './language-provider';

const originalLanguage = window.navigator.language;
const originalLanguages = window.navigator.languages;

const stubNavigatorLanguages = (languages: string[], language = languages[0] ?? '') => {
    Object.defineProperty(window.navigator, 'languages', { configurable: true, value: languages });
    Object.defineProperty(window.navigator, 'language', { configurable: true, value: language });
};

/**
 * `language.switchTo` is the probe of choice because its *wording*, not just
 * its placeholder, differs per dictionary — a language name is written in its
 * own script in every locale, so `language.name.*` reads the same either way
 * and cannot show that the dictionary actually changed.
 */
function Probe() {
    const { language, setLanguage, t } = useTranslation();

    return (
        <>
            <span data-slot="probe-language">{language}</span>
            <span data-slot="probe-wording">{t('language.switchTo', { language: 'X' })}</span>
            <button
                onClick={() => setLanguage('zh')}
                type="button"
            >
                to-zh
            </button>
            <button
                onClick={() => setLanguage('en')}
                type="button"
            >
                to-en
            </button>
        </>
    );
}

const renderProbe = (props: { defaultLanguage?: 'en' | 'zh' } = {}) =>
    render(
        <LanguageProvider {...props}>
            <Probe />
        </LanguageProvider>,
    );

const wording = () => screen.getByText(/^(Switch to X|切换到X)$/).textContent;

beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    stubNavigatorLanguages(['en-US']);
});

afterEach(() => {
    Object.defineProperty(window.navigator, 'languages', { configurable: true, value: originalLanguages });
    Object.defineProperty(window.navigator, 'language', { configurable: true, value: originalLanguage });
});

describe('LanguageProvider', () => {
    it('detects the language when nothing is stored', () => {
        stubNavigatorLanguages(['zh-CN']);

        renderProbe();

        expect(screen.getByText('zh')).toBeInTheDocument();
    });

    it('prefers the stored choice over detection', () => {
        stubNavigatorLanguages(['zh-CN']);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify('en'));

        renderProbe();

        expect(screen.getByText('en')).toBeInTheDocument();
    });

    it('honours the defaultLanguage prop only when nothing is stored', () => {
        renderProbe({ defaultLanguage: 'zh' });

        expect(screen.getByText('zh')).toBeInTheDocument();
    });

    it('lets a stored choice override the defaultLanguage prop', () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify('en'));

        renderProbe({ defaultLanguage: 'zh' });

        expect(screen.getByText('en')).toBeInTheDocument();
    });

    it('ignores a stored value that is not a shipped language', () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify('klingon'));

        renderProbe();

        expect(screen.getByText('en')).toBeInTheDocument();
    });

    it('survives a stored value that is not valid JSON', () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, 'not json');

        renderProbe();

        expect(screen.getByText('en')).toBeInTheDocument();
    });

    it('translates with the active dictionary', () => {
        renderProbe();

        expect(wording()).toBe('Switch to X');
    });

    it('keeps <html lang> in step with the active language', async () => {
        renderProbe();

        expect(document.documentElement.lang).toBe('en');

        await userEvent.click(screen.getByRole('button', { name: 'to-zh' }));

        expect(document.documentElement.lang).toBe('zh');
    });

    it('persists a switch so the next visit starts there', async () => {
        renderProbe();

        await userEvent.click(screen.getByRole('button', { name: 'to-zh' }));

        expect(screen.getByText('zh')).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? 'null')).toBe('zh');
    });

    it('hands consumers the other dictionary after a switch', async () => {
        renderProbe();

        await userEvent.click(screen.getByRole('button', { name: 'to-zh' }));

        expect(wording()).toBe('切换到X');
    });
});
