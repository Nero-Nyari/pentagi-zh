import type { Dictionary } from '../en';

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
 * Chinese dictionary. `satisfies Dictionary` is what keeps it honest: adding
 * a key to an English namespace file without adding it here is a compile
 * error naming the missing key.
 */
export const zh = {
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
} satisfies Dictionary;
