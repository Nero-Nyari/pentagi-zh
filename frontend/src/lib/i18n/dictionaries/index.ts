import type { Language } from '../types';

import { type Dictionary, en } from './en';
import { zh } from './zh';

/**
 * Every shipped dictionary, keyed by language. The `Record<Language, …>`
 * annotation is load-bearing: adding a member to `Language` without adding
 * its dictionary here fails to compile.
 */
export const dictionaries: Record<Language, Dictionary> = { en, zh };
