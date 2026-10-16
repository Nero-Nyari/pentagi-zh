import type { LucideIcon } from 'lucide-react';

import {
    BotMessageSquare,
    Brain,
    CheckSquare,
    FileText,
    Globe,
    HelpCircle,
    MessageSquareReply,
    NotepadText,
    Search,
    Terminal,
    User as UserIcon,
} from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/types';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageLogType } from '@/graphql/types';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

interface MessageTypeIconProps {
    className?: string;
    tooltip?: string;
    type?: MessageLogType;
}

const messageTypeIcons: Record<MessageLogType, LucideIcon> = {
    [MessageLogType.Advice]: BotMessageSquare,
    [MessageLogType.Answer]: MessageSquareReply,
    [MessageLogType.Ask]: HelpCircle,
    [MessageLogType.Browser]: Globe,
    [MessageLogType.Done]: CheckSquare,
    [MessageLogType.File]: FileText,
    [MessageLogType.Input]: UserIcon,
    [MessageLogType.Report]: NotepadText,
    [MessageLogType.Search]: Search,
    [MessageLogType.Terminal]: Terminal,
    [MessageLogType.Thoughts]: Brain,
};
const defaultIcon = Brain;

// 消息类型枚举直接呈现给用户，先映射到词典键再按当前语言渲染。
const messageTypeLabelKeys: Record<MessageLogType, TranslationKey> = {
    [MessageLogType.Advice]: 'flows.messageType.advice',
    [MessageLogType.Answer]: 'flows.messageType.answer',
    [MessageLogType.Ask]: 'flows.messageType.ask',
    [MessageLogType.Browser]: 'flows.messageType.browser',
    [MessageLogType.Done]: 'flows.messageType.done',
    [MessageLogType.File]: 'flows.messageType.file',
    [MessageLogType.Input]: 'flows.messageType.input',
    [MessageLogType.Report]: 'flows.messageType.report',
    [MessageLogType.Search]: 'flows.messageType.search',
    [MessageLogType.Terminal]: 'flows.messageType.terminal',
    [MessageLogType.Thoughts]: 'flows.messageType.thoughts',
};

function FlowMessageTypeIcon({ className, tooltip, type }: MessageTypeIconProps) {
    const { t } = useTranslation();
    const Icon = type ? messageTypeIcons[type] || defaultIcon : defaultIcon;
    const iconElement = <Icon className={cn('size-3 shrink-0', className)} />;
    const label = tooltip ?? (type ? t(messageTypeLabelKeys[type]) : undefined);

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

export default FlowMessageTypeIcon;
