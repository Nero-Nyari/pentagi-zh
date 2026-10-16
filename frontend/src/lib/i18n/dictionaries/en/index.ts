import { auth } from './auth';
import { common } from './common';
import { dashboard } from './dashboard';
import { errors } from './errors';
import { flows } from './flows';
import { knowledges } from './knowledges';
import { nav } from './nav';
import { report } from './report';
import { resources } from './resources';
import { settings } from './settings';
import { shared } from './shared';
import { templates } from './templates';
import { ui } from './ui';

/**
 * English dictionary — the canonical source of truth for every translatable
 * string in the UI.
 *
 * Keys are flat and dot-namespaced (`common.theme`, `nav.flows`) rather than
 * nested. Flat keys keep `keyof Dictionary` cheap for TypeScript, make a
 * missing translation a compile error instead of a runtime `undefined`, and
 * let the one-namespace-per-file split below be merged without losing key
 * precision.
 *
 * Each file owns the copy for one area of the product — add a string to the
 * namespace that owns its screen, then mirror it in `dictionaries/zh`.
 * `dictionaries.test.ts` fails when the two key sets diverge, when a
 * translation is blank, or when a `{placeholder}` is dropped in translation.
 */
export const en = {
    ...auth,
    ...common,
    ...dashboard,
    ...errors,
    ...flows,
    ...knowledges,
    ...nav,
    ...report,
    ...resources,
    ...settings,
    ...shared,
    ...templates,
    ...ui,
};

/**
 * Shape every dictionary must satisfy. `zh` is typed against this, so a key
 * present here but missing there is a type error.
 */
export type Dictionary = typeof en;

/** Every valid translation key. Used to keep `t()` call sites honest. */
export type TranslationKey = keyof Dictionary;
