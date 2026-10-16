import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { OverwriteOutcome } from '@/components/shared/overwrite';
import type { Translator } from '@/lib/i18n/types';

import { useTranslation } from '@/hooks/use-translation';
import { api, getApiErrorMessage, getApiErrorStatusCode } from '@/lib/axios';

import { RESOURCES_MOVE_API_PATH } from './resources-constants';

// 校验消息随语言切换，因此 schema 由 t 工厂生成；调用方在组件内 useMemo 生成本地化实例。
export const createResourcesMoveFormSchema = (t: Translator) =>
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

export type ResourcesMoveFormValues = z.infer<ReturnType<typeof createResourcesMoveFormSchema>>;

interface MoveRequestBody {
    destination: string;
    force: boolean;
    sources: readonly string[];
}

interface UseResourcesMoveResult {
    isMoving: boolean;
    /**
     * Issue a batch move in a single atomic request and return a discriminated outcome:
     *   - `ok`        — every source was moved (success toast already fired),
     *   - `conflict`  — at least one destination is occupied (no toast, caller
     *                   resolves via the shared overwrite workflow),
     *   - `error`     — anything else (failure toast already fired).
     *
     * Backend semantics: with one source, `destination` is the exact target
     * path; with multiple sources, `destination` is treated as a base directory
     * and each source lands at `destination/<basename>`. Either way, the whole
     * batch executes inside one DB transaction — partial state is impossible.
     */
    move: (sources: readonly string[], destination: string, force: boolean) => Promise<OverwriteOutcome>;
}

/** Wraps `PUT /resources/move` for rename / move / batch-move operations. */
export function useResourcesMove(): UseResourcesMoveResult {
    const { t } = useTranslation();
    const [isMoving, setIsMoving] = useState(false);

    const move = useCallback(
        async (sources: readonly string[], destination: string, force: boolean): Promise<OverwriteOutcome> => {
            if (sources.length === 0) {
                return { kind: 'error' };
            }

            setIsMoving(true);

            try {
                await api.put<void, MoveRequestBody>(RESOURCES_MOVE_API_PATH, {
                    destination,
                    force,
                    sources,
                });

                const description =
                    sources.length === 1
                        ? t('resources.moveDialog.success.single', { destination })
                        : t('resources.moveDialog.success.multi', {
                              count: sources.length,
                              destination,
                          });

                toast.success(t('resources.moveDialog.success.title'), { description });

                return { kind: 'ok' };
            } catch (error) {
                // 409 = at least one destination already exists. Surface as
                // `conflict` so the shared overwrite workflow can prompt the
                // user; success / error toasts stay aligned with the outcome
                // they pick.
                if (!force && getApiErrorStatusCode(error) === 409) {
                    return { kind: 'conflict' };
                }

                const description = getApiErrorMessage(error, t('resources.moveDialog.error.fallback'));

                toast.error(t('resources.moveDialog.error.title'), { description });

                return { kind: 'error' };
            } finally {
                setIsMoving(false);
            }
        },
        [t],
    );

    return {
        isMoving,
        move,
    };
}
