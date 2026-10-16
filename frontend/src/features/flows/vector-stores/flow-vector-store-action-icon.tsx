import type { LucideIcon } from 'lucide-react';

import { HardDrive, HardDriveDownload, HardDriveUpload } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/types';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { VectorStoreAction } from '@/graphql/types';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

interface FlowVectorStoreActionIconProps {
    action?: VectorStoreAction;
    className?: string;
    tooltip?: string;
}

const icons: Record<VectorStoreAction, LucideIcon> = {
    [VectorStoreAction.Retrieve]: HardDriveUpload,
    [VectorStoreAction.Store]: HardDriveDownload,
};
const defaultIcon = HardDrive;

// 动作枚举会直接作为 tooltip 呈现给用户，因此映射到词典键，渲染时再按当前语言取文案。
const actionLabelKeys: Record<VectorStoreAction, TranslationKey> = {
    [VectorStoreAction.Retrieve]: 'flows.vectors.action.retrieve',
    [VectorStoreAction.Store]: 'flows.vectors.action.store',
};

function FlowVectorStoreActionIcon({ action, className, tooltip }: FlowVectorStoreActionIconProps) {
    const { t } = useTranslation();
    const Icon = action ? icons[action] || defaultIcon : defaultIcon;
    const hasTooltip = Boolean(tooltip) || Boolean(action);
    const iconElement = <Icon className={cn('size-3 shrink-0', hasTooltip && 'cursor-pointer', className)} />;

    if (!hasTooltip) {
        return iconElement;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{iconElement}</TooltipTrigger>
            <TooltipContent>{tooltip ?? (action ? t(actionLabelKeys[action]) : '')}</TooltipContent>
        </Tooltip>
    );
}

export default FlowVectorStoreActionIcon;
