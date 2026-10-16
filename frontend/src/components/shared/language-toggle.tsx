import { Languages } from 'lucide-react';

import type { Language } from '@/lib/i18n/types';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

/**
 * The language a click lands on. Two languages today, so a toggle is the
 * whole interaction — a dropdown only starts paying for itself at three, and
 * the current language is already visible in the control's own label.
 */
const nextLanguage = (language: Language): Language => (language === 'zh' ? 'en' : 'zh');

interface LanguageToggleProps {
    className?: string;
}

/**
 * Flips the interface between the shipped languages.
 *
 * Rendered by `AppHeaderActions`, so it lands at the right edge of every
 * page header. Built on `Button` rather than `AppHeaderAction` on purpose:
 * `AppHeaderAction` lives in the same module that hosts this component, and
 * reaching for it here would close an import cycle.
 *
 * The label shows the language currently in effect, and the accessible name
 * spells out the one a click would switch *to* — a bare "EN" is ambiguous
 * about which of the two it currently means.
 */
export function LanguageToggle({ className }: LanguageToggleProps) {
    const { language, setLanguage, t } = useTranslation();
    const target = nextLanguage(language);
    const label = t('language.switchTo', { language: t(`language.name.${target}`) });

    return (
        <Button
            aria-label={label}
            className={cn('text-muted-foreground hover:text-foreground gap-1.5', className)}
            onClick={() => setLanguage(target)}
            size="sm"
            title={label}
            variant="ghost"
        >
            <Languages />
            <span className="text-xs font-semibold">{t(`language.short.${language}`)}</span>
        </Button>
    );
}
