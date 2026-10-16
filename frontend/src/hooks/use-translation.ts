import { useContext } from 'react';

import { LanguageProviderContext } from '@/providers/language-provider';

/**
 * Access the active language and the translator bound to it.
 *
 * Unlike `useTheme`, this never throws when no provider is mounted — the
 * context's default value is a working English translator, so a subtree (or
 * a test rendering one component in isolation) still renders real copy. See
 * the note on `initialState` in `language-provider.tsx`.
 */
export function useTranslation() {
    return useContext(LanguageProviderContext);
}
