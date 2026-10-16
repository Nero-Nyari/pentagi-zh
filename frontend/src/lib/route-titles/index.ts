import type { TranslationKey, Translator } from '@/lib/i18n/types';

import {
    FlowDocument,
    FlowTemplateDocument,
    KnowledgeDocumentDocument,
    SettingsProvidersDocument,
} from '@/graphql/types';

import { apolloTitle, type ApolloTitleComponent } from './apollo-title';
import { formatPromptId } from './format-prompt-id';
import { type RouteParams } from './render-title';

export interface RouteTitleHandle {
    title: TitleResolver;
}

/**
 * A `handle.title` value can be one of three forms:
 *   - `string` — fully static, known at build time, never translated. Kept
 *     for chrome that isn't user-facing copy (tests, mostly).
 *   - `(params, t) => string` — derived synchronously from URL params.
 *   - `ComponentType<{ params }>` — reactive (e.g. subscribes to Apollo
 *     cache for resource-driven titles). Must be produced by `apolloTitle()`
 *     so the marker it attaches lets `DocumentTitle` distinguish a component
 *     from a `(params, t) => string` resolver at runtime. A hand-rolled
 *     component function will be misdetected as a resolver and called with
 *     raw params — always route reactive titles through `apolloTitle()`.
 *
 * The translator arrives as an argument rather than being pulled from a hook
 * so that this registry stays a plain module-level table. `DocumentTitle`
 * subscribes to the language context and re-resolves on every switch, which
 * is what makes the document `<title>` follow the language.
 */
export type TitleResolver = ((params: RouteParams, t: Translator) => string) | ApolloTitleComponent | string;

/** Shorthand for a title that only ever resolves to one dictionary entry. */
const routeTitle =
    (key: TranslationKey): TitleResolver =>
    (_params: RouteParams, t: Translator) =>
        t(key);

/**
 * Single source of truth for every route's document `<title>`. `app.tsx`
 * imports nothing from Apollo for title purposes — it only spreads handles
 * from this registry onto the matching <Route>.
 */
export const routeTitles = {
    account: { title: routeTitle('nav.account') },
    apiTokens: { title: routeTitle('nav.apiTokens') },
    dashboard: { title: routeTitle('nav.dashboard') },
    flow: {
        title: apolloTitle({
            document: FlowDocument,
            select: (data, { flowId }, t) =>
                data?.flow?.title && flowId
                    ? t('nav.flowTitle', { id: flowId, title: data.flow.title })
                    : t('nav.flow'),
            variables: ({ flowId }) => (flowId ? { id: flowId } : null),
        }),
    },
    flowReport: { title: routeTitle('nav.flowReport') },
    flows: { title: routeTitle('nav.flows') },
    knowledge: {
        title: apolloTitle({
            document: KnowledgeDocumentDocument,
            select: (data, { knowledgeId }, t) =>
                knowledgeId === 'new' ? t('nav.newKnowledge') : data?.knowledgeDocument?.question || t('nav.knowledge'),
            variables: ({ knowledgeId }) => (!knowledgeId || knowledgeId === 'new' ? null : { id: knowledgeId }),
        }),
    },
    knowledges: { title: routeTitle('nav.knowledges') },
    login: { title: routeTitle('nav.login') },
    newFlow: { title: routeTitle('nav.newFlow') },
    oauth: { title: routeTitle('nav.oauth') },
    prompt: {
        // A prompt id is an internal key (`primaryAgent`), not copy — it stays
        // in its canonical camelCase form; only the fallback is translated.
        title: (params: RouteParams, t: Translator) =>
            params.promptId ? formatPromptId(params.promptId) : t('nav.prompt'),
    },
    prompts: { title: routeTitle('nav.prompts') },

    provider: {
        title: apolloTitle({
            document: SettingsProvidersDocument,
            select: (data, { providerId }, t) => {
                if (providerId === 'new') {
                    return t('nav.newProvider');
                }

                const provider = data?.settingsProviders.userDefined?.find(
                    (candidate) => String(candidate.id) === providerId,
                );

                return provider?.name || t('nav.provider');
            },
            variables: ({ providerId }) => (providerId === 'new' ? null : {}),
        }),
    },

    providers: { title: routeTitle('nav.providers') },

    resources: { title: routeTitle('nav.resources') },

    template: {
        title: apolloTitle({
            document: FlowTemplateDocument,
            select: (data, { templateId }, t) =>
                templateId === 'new' ? t('nav.newTemplate') : data?.flowTemplate?.title || t('nav.template'),
            variables: ({ templateId }) => (!templateId || templateId === 'new' ? null : { templateId }),
        }),
    },

    templates: { title: routeTitle('nav.templates') },
} as const satisfies Record<string, RouteTitleHandle>;
