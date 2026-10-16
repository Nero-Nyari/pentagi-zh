import { Copy } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

import type { VectorStoreLogFragmentFragment } from '@/graphql/types';
import type { Translator } from '@/lib/i18n/types';

import Markdown from '@/components/shared/markdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import FlowAgentIcon from '@/features/flows/agents/flow-agent-icon';
import { VectorStoreAction } from '@/graphql/types';
import { useTranslation } from '@/hooks/use-translation';
import { copyMessageToClipboard } from '@/lib/clipboard';
import { matchesSearchTerm } from '@/lib/text-filter';
import { formatDate } from '@/lib/utils/format';

import FlowVectorStoreActionIcon from './flow-vector-store-action-icon';

const getDescription = (log: VectorStoreLogFragmentFragment, t: Translator) => {
    const { action, filter } = log;
    const {
        answer_type: answerType,
        code_lang: codeLang,
        doc_type: docType,
        guide_type: guideType,
        tool_name: toolName,
    } = JSON.parse(filter) || {};

    const isStore = action === VectorStoreAction.Store;
    let description = '';

    if (docType) {
        if (docType === 'memory') {
            description = isStore
                ? t('flows.vectors.describe.memoryStored')
                : t('flows.vectors.describe.memoryRetrieved');
        } else {
            description = isStore
                ? t('flows.vectors.describe.stored', { docType })
                : t('flows.vectors.describe.retrieved', { docType });
        }
    }

    // 依次拼接各可选描述片段：首段直接取值，后续片段以空格连接。
    const append = (part: string) => {
        description = description ? `${description} ${part}` : part;
    };

    if (codeLang) {
        append(t('flows.vectors.describe.onLanguage', { lang: codeLang }));
    }

    if (toolName) {
        append(t('flows.vectors.describe.byTool', { tool: toolName }));
    }

    if (guideType) {
        append(t('flows.vectors.describe.aboutGuide', { guide: guideType }));
    }

    if (answerType) {
        append(t('flows.vectors.describe.asAnswer', { answer: answerType }));
    }

    return description;
};

interface FlowVectorStoreProps {
    log: VectorStoreLogFragmentFragment;
    searchValue?: string;
}

function FlowVectorStore({ log, searchValue = '' }: FlowVectorStoreProps) {
    const { t } = useTranslation();
    const { action, createdAt, executor, initiator, query, result, subtaskId, taskId } = log;

    const searchChecks = useMemo(() => {
        const trimmedSearch = searchValue.trim();

        if (!trimmedSearch) {
            return { hasQueryMatch: false, hasResultMatch: false };
        }

        return {
            hasQueryMatch: matchesSearchTerm(query, trimmedSearch),
            hasResultMatch: matchesSearchTerm(result, trimmedSearch),
        };
    }, [searchValue, query, result]);

    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
    const [prevHasResultMatch, setPrevHasResultMatch] = useState(searchChecks.hasResultMatch);

    if (searchValue !== prevSearchValue || searchChecks.hasResultMatch !== prevHasResultMatch) {
        setPrevSearchValue(searchValue);
        setPrevHasResultMatch(searchChecks.hasResultMatch);

        const trimmedSearch = searchValue.trim();

        if (trimmedSearch) {
            if (searchChecks.hasResultMatch) {
                setIsDetailsVisible(true);
            }
        } else {
            setIsDetailsVisible(false);
        }
    }

    const description = getDescription(log, t);

    const handleCopy = useCallback(async () => {
        await copyMessageToClipboard(
            {
                message: query,
                result: result || undefined,
            },
            t,
        );
    }, [query, result, t]);

    return (
        <div className="flex flex-col items-start">
            <div className="bg-card text-card-foreground max-w-full rounded-xl border p-3 shadow-sm">
                <div className="flex flex-col">
                    <div className="cursor-pointer text-sm font-semibold">
                        <span className="inline-flex items-center gap-1">
                            <FlowVectorStoreActionIcon action={action} />
                            <span>{description}</span>
                        </span>
                    </div>

                    <Markdown
                        className="prose-xs prose-fixed wrap-break-word"
                        searchValue={searchValue}
                    >
                        {query}
                    </Markdown>
                </div>
                {result && (
                    <div className="text-muted-foreground mt-2 text-xs">
                        <div
                            className="cursor-pointer"
                            onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                        >
                            {isDetailsVisible ? t('flows.common.hideDetails') : t('flows.common.showDetails')}
                        </div>
                        {isDetailsVisible && (
                            <>
                                <div className="my-3 border-t" />
                                <Markdown
                                    className="prose-xs prose-fixed wrap-break-word"
                                    searchValue={searchValue}
                                >
                                    {result}
                                </Markdown>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="text-muted-foreground mt-1 flex items-center gap-1 px-1 text-xs">
                <span className="flex items-center gap-0.5">
                    <FlowAgentIcon
                        className="text-muted-foreground"
                        type={initiator}
                    />
                    <span className="text-muted-foreground/50">→</span>
                    <FlowAgentIcon
                        className="text-muted-foreground"
                        type={executor}
                    />
                </span>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Copy
                            className="hover:text-foreground mx-1 size-3 shrink-0 cursor-pointer transition-colors"
                            onClick={handleCopy}
                        />
                    </TooltipTrigger>
                    <TooltipContent>{t('flows.common.copy')}</TooltipContent>
                </Tooltip>
                <span className="text-muted-foreground/50">{formatDate(new Date(createdAt))}</span>
                {taskId && (
                    <>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="text-muted-foreground/50">{t('flows.common.taskId', { id: taskId })}</span>
                    </>
                )}
                {subtaskId && (
                    <>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="text-muted-foreground/50">
                            {t('flows.common.subtaskId', { id: subtaskId })}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

export default memo(FlowVectorStore);
