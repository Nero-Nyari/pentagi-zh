import type { TranslationKey } from '@/lib/i18n/types';

import { StatusType } from '@/graphql/types';

// 状态枚举会直接呈现给用户（tooltip / aria-label），这里只存词典键，渲染时再按当前语言取文案。
export const flowStatusLabelKeys: Record<StatusType, TranslationKey> = {
    [StatusType.Created]: 'flows.status.created',
    [StatusType.Failed]: 'flows.status.failed',
    [StatusType.Finished]: 'flows.status.finished',
    [StatusType.Running]: 'flows.status.running',
    [StatusType.Waiting]: 'flows.status.waiting',
};
