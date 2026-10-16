import type { TranslationKey } from './types';

/**
 * Dictionary keys for agent role names, keyed by the camelCase spelling the
 * GraphQL API uses for agent config keys (`primaryAgent`, `toolCallFixer`).
 *
 * The `AgentType` enum spells the same roles in snake_case, so components that
 * start from the enum map through a table of their own before landing here;
 * that table is exhaustive over the enum, which means a role cannot be added
 * without someone having to give it a label.
 */
export const agentTypeLabels = {
    adviser: 'flows.agentType.adviser',
    assistant: 'flows.agentType.assistant',
    coder: 'flows.agentType.coder',
    enricher: 'flows.agentType.enricher',
    generator: 'flows.agentType.generator',
    installer: 'flows.agentType.installer',
    memorist: 'flows.agentType.memorist',
    pentester: 'flows.agentType.pentester',
    primaryAgent: 'flows.agentType.primaryAgent',
    refiner: 'flows.agentType.refiner',
    reflector: 'flows.agentType.reflector',
    reporter: 'flows.agentType.reporter',
    searcher: 'flows.agentType.searcher',
    summarizer: 'flows.agentType.summarizer',
    toolCallFixer: 'flows.agentType.toolCallFixer',
} as const satisfies Record<string, TranslationKey>;

export type AgentTypeKey = keyof typeof agentTypeLabels;

/** Dictionary key for an agent role, or `null` when `key` is not one. */
export const agentTypeLabel = (key: string): null | TranslationKey =>
    key in agentTypeLabels ? agentTypeLabels[key as AgentTypeKey] : null;
