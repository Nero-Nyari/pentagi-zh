import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { LANGUAGE_STORAGE_KEY, LanguageProvider } from '@/providers/language-provider';

import { LanguageToggle } from './language-toggle';

const renderToggle = (defaultLanguage: 'en' | 'zh') =>
    render(
        <LanguageProvider defaultLanguage={defaultLanguage}>
            <LanguageToggle />
        </LanguageProvider>,
    );

beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
});

describe('LanguageToggle', () => {
    it('labels itself with the language currently in effect', () => {
        renderToggle('en');

        expect(screen.getByRole('button')).toHaveTextContent('EN');
    });

    it('names the language a press would switch to, not the current one', () => {
        renderToggle('en');

        expect(screen.getByRole('button')).toHaveAccessibleName('Switch to 中文');
    });

    it('switches to the other language and relabels itself', async () => {
        renderToggle('en');

        await userEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('中文');
        expect(screen.getByRole('button')).toHaveAccessibleName('切换到English');
    });

    it('persists the choice', async () => {
        renderToggle('en');

        await userEvent.click(screen.getByRole('button'));

        expect(JSON.parse(localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? 'null')).toBe('zh');
    });

    it('switches back', async () => {
        renderToggle('zh');

        await userEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('EN');
    });

    it('renders in English outside a provider rather than throwing', () => {
        render(<LanguageToggle />);

        expect(screen.getByRole('button')).toHaveTextContent('EN');
    });
});
