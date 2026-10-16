import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { OverwriteOutcome } from '@/components/shared/overwrite';
import type { Translator } from '@/lib/i18n/types';

import { useTranslation } from '@/hooks/use-translation';
import { api, getApiErrorMessage, getApiErrorStatusCode } from '@/lib/axios';

import { RESOURCES_COPY_API_PATH } from './resources-constants';

// 校验消息随语言切换，因此 schema 由 t 工厂生成；调用方在组件内 useMemo 生成本地化实例。
export const createResourcesCopyFormSchema = (t: Translator) =>
    z.object({
        destination: z
            .string()
            .trim()
            .min(1, { message: t('resources.destinationForm.validation.required') })
            .refine((value) => !value.startsWith('/'), {
                message: t('resources.destinationForm.validation.relative'),
            })
            .refine((value) => !value.split('/').includes('..'), {
                message: t('resources.destinationForm.validation.noParent'),
            }),
    });

export type ResourcesCopyFormValues = z.infer<ReturnType<typeof createResourcesCopyFormSchema>>;

interface CopyRequestBody {
    destination: string;
    force: boolean;
    sources: readonly string[];
}

interface UseResourcesCopyResult {
    /**
     * Issue a batch copy in a single atomic request and return a discriminated outcome:
     *   - `ok`        — every source was copied (success toast already fired),
     *   - `conflict`  — at least one destination is occupied (no toast, caller
     *                   resolves via the shared overwrite workflow),
     *   - `error`     — anything else (failure toast already fired).
     *
     * Backend semantics: with one source, `destination` is the exact target
     * path; with multiple sources, `destination` is a base directory and each
     * source lands at `destination/<basename>`. Either way, the whole batch
     * executes inside one DB transaction.
     */
    copy: (sources: readonly string[], destination: string, force: boolean) => Promise<OverwriteOutcome>;
    isCopying: boolean;
}

/** Wraps `POST /resources/copy` for single and batch copy operations. */
export function useResourcesCopy(): UseResourcesCopyResult {
    const { t } = useTranslation();
    const [isCopying, setIsCopying] = useState(false);

    const copy = useCallback(
        async (sources: readonly string[], destination: string, force: boolean): Promise<OverwriteOutcome> => {
            if (sources.length === 0) {
                return { kind: 'error' };
            }

            setIsCopying(true);

            try {
                await api.post<void, CopyRequestBody>(RESOURCES_COPY_API_PATH, {
                    destination,
                    force,
                    sources,
                });

                const description =
                    sources.length === 1
                        ? t('resources.copyDialog.success.single', { destination })
                        : t('resources.copyDialog.success.multi', {
                              count: sources.length,
                              destination,
                          });

                toast.success(t('resources.copyDialog.success.title'), { description });

                return { kind: 'ok' };
            } catch (error) {
                if (!force && getApiErrorStatusCode(error) === 409) {
                    return { kind: 'conflict' };
                }

                const description = getApiErrorMessage(error, t('resources.copyDialog.error.fallback'));

                toast.error(t('resources.copyDialog.error.title'), { description });

                return { kind: 'error' };
            } finally {
                setIsCopying(false);
            }
        },
        [t],
    );

    return {
        copy,
        isCopying,
    };
}
