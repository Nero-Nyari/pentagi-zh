import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { Translator } from '@/lib/i18n/types';

import { useTranslation } from '@/hooks/use-translation';
import { api, getApiErrorMessage } from '@/lib/axios';

import { RESOURCES_MKDIR_API_PATH } from './resources-constants';

// 校验消息随语言切换，因此 schema 由 t 工厂生成；调用方在组件内 useMemo 生成本地化实例。
export const createResourcesMkdirFormSchema = (t: Translator) =>
    z.object({
        path: z
            .string()
            .trim()
            .min(1, { message: t('resources.mkdirDialog.validation.required') })
            .refine((value) => !value.startsWith('/'), {
                message: t('resources.mkdirDialog.validation.relative'),
            })
            .refine((value) => !value.split('/').includes('..'), {
                message: t('resources.mkdirDialog.validation.noParent'),
            }),
    });

export type ResourcesMkdirFormValues = z.infer<ReturnType<typeof createResourcesMkdirFormSchema>>;

interface MkdirRequestBody {
    path: string;
}

interface UseResourcesMkdirResult {
    isCreating: boolean;
    mkdir: (values: ResourcesMkdirFormValues) => Promise<boolean>;
}

/** Wraps `POST /resources/mkdir` (idempotent — returns existing dir on hit). */
export function useResourcesMkdir(): UseResourcesMkdirResult {
    const { t } = useTranslation();
    const [isCreating, setIsCreating] = useState(false);

    const mkdir = useCallback(
        async ({ path }: ResourcesMkdirFormValues): Promise<boolean> => {
            setIsCreating(true);

            try {
                await api.post<void, MkdirRequestBody>(RESOURCES_MKDIR_API_PATH, { path: path.trim() });

                toast.success(t('resources.mkdirDialog.success.title'), {
                    description: t('resources.mkdirDialog.success.description', { path: path.trim() }),
                });

                return true;
            } catch (error) {
                const description = getApiErrorMessage(error, t('resources.mkdirDialog.error.fallback'));

                toast.error(t('resources.mkdirDialog.error.title'), { description });

                return false;
            } finally {
                setIsCreating(false);
            }
        },
        [t],
    );

    return {
        isCreating,
        mkdir,
    };
}
