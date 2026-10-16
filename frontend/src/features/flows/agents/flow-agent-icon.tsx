import type { LucideIcon } from 'lucide-react';

import {
    Bot,
    Brain,
    Code2,
    FileText,
    HardDrive,
    HardDriveDownload,
    HelpCircle,
    LayoutList,
    MessagesSquare,
    RefreshCw,
    Search,
    Settings,
    Sigma,
    Skull,
    Wrench,
} from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AgentType } from '@/graphql/types';
import { useTranslation } from '@/hooks/use-translation';
import { type AgentTypeKey, agentTypeLabels } from '@/lib/i18n/agent-types';
import { cn } from '@/lib/utils';
import { formatName } from '@/lib/utils/format';

interface FlowAgentIconProps {
    className?: string;
    tooltip?: string;
    type?: AgentType;
}

const icons: Record<AgentType, LucideIcon> = {
    [AgentType.Adviser]: HelpCircle,
    [AgentType.Assistant]: Bot,
    [AgentType.Coder]: Code2,
    [AgentType.Enricher]: HardDriveDownload,
    [AgentType.Generator]: LayoutList,
    [AgentType.Installer]: Settings,
    [AgentType.Memorist]: HardDrive,
    [AgentType.Pentester]: Skull,
    [AgentType.PrimaryAgent]: Brain,
    [AgentType.Refiner]: RefreshCw,
    [AgentType.Reflector]: MessagesSquare,
    [AgentType.Reporter]: FileText,
    [AgentType.Searcher]: Search,
    [AgentType.Summarizer]: Sigma,
    [AgentType.ToolCallFixer]: Wrench,
};

/**
 * The camelCase spelling of each agent type — the same spelling the API uses
 * for its agent config keys, and what the role labels in `agentTypeLabels` are
 * keyed by. The enum itself is snake_case (`primary_agent`), which no label key
 * can be derived from mechanically.
 */
const agentTypeKeys: Record<AgentType, AgentTypeKey> = {
    [AgentType.Adviser]: 'adviser',
    [AgentType.Assistant]: 'assistant',
    [AgentType.Coder]: 'coder',
    [AgentType.Enricher]: 'enricher',
    [AgentType.Generator]: 'generator',
    [AgentType.Installer]: 'installer',
    [AgentType.Memorist]: 'memorist',
    [AgentType.Pentester]: 'pentester',
    [AgentType.PrimaryAgent]: 'primaryAgent',
    [AgentType.Refiner]: 'refiner',
    [AgentType.Reflector]: 'reflector',
    [AgentType.Reporter]: 'reporter',
    [AgentType.Searcher]: 'searcher',
    [AgentType.Summarizer]: 'summarizer',
    [AgentType.ToolCallFixer]: 'toolCallFixer',
};

const defaultIcon = HelpCircle;

function FlowAgentIcon({ className, tooltip, type }: FlowAgentIconProps) {
    const { t } = useTranslation();
    const Icon = type ? icons[type] || defaultIcon : defaultIcon;
    const iconElement = <Icon className={cn('size-3 shrink-0', className)} />;

    // An explicit `tooltip` is a label the caller owns — usually a value that
    // came off the wire — so it is only tidied up, never translated. The
    // default one is our own enum, and that one is ours to translate.
    const label =
        tooltip === undefined ? (type ? t(agentTypeLabels[agentTypeKeys[type]]) : undefined) : formatName(tooltip);

    if (!label) {
        return iconElement;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{iconElement}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

export default FlowAgentIcon;
