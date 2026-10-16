import { useCallback } from 'react';

import { useDetailNavigation } from '@/components/shared/detail-navigation';
import { useTranslation } from '@/hooks/use-translation';
import { routes } from '@/lib/routes';
import { type Flow, useFlows } from '@/providers/flows-provider';

const getSearchableText = (item: Flow) => item.title;
const getId = (item: Flow) => String(item.id);
const getHref = (item: Flow) => routes.flow(item.id);

/**
 * Detail-page navigation wired up for flows. Encapsulates the getter
 * callbacks and the call to `useDetailNavigation` so each detail page just
 * passes the returned controller to `<DetailNavigationToolbar controller={nav}>`
 * (or to its leaf primitives for custom chrome).
 *
 * Pass `null` instead of an id while the page is in a non-viewing state
 * (e.g. `/flows/new`) so the controller reports an unmatched current item.
 */
export function useFlowDetailNavigation(currentId: null | string | undefined) {
    const { t } = useTranslation();
    const { flows } = useFlows();

    // 标题缺失时用本地化的“Flow #id”兜底；`t` 随语言变化而变，因此必须进依赖数组。
    const getLabel = useCallback((item: Flow) => item.title || t('flows.detail.fallbackTitle', { id: item.id }), [t]);

    return useDetailNavigation<Flow>({
        currentId,
        getHref,
        getId,
        getLabel,
        getSearchableText,
        items: flows,
    });
}
