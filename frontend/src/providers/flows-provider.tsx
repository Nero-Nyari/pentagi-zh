import { useMutation, useQuery, useSubscription } from '@apollo/client/react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { toast } from 'sonner';

import type { FlowFormValues } from '@/features/flows/flow-form';
import type { FlowFragmentFragment, FlowsQuery } from '@/graphql/types';

import {
    CreateAssistantDocument,
    CreateFlowDocument,
    DeleteFlowDocument,
    FinishFlowDocument,
    FlowCreatedDocument,
    FlowDeletedDocument,
    FlowsDocument,
    FlowUpdatedDocument,
} from '@/graphql/types';
import { useTranslation } from '@/hooks/use-translation';
import { Log } from '@/lib/log';

export type Flow = FlowFragmentFragment;

interface FlowsContextValue {
    createFlow: (values: FlowFormValues) => Promise<null | string>;
    createFlowWithAssistant: (values: FlowFormValues) => Promise<null | string>;
    deleteFlow: (flow: Flow) => Promise<boolean>;
    finishFlow: (flow: Flow) => Promise<boolean>;
    flows: Array<Flow>;
    flowsData: FlowsQuery | undefined;
    flowsError: Error | undefined;
    isLoading: boolean;
    refetch: () => unknown;
}

const FlowsContext = createContext<FlowsContextValue | undefined>(undefined);

interface FlowsProviderProps {
    children: React.ReactNode;
}

export function FlowsProvider({ children }: FlowsProviderProps) {
    const { t } = useTranslation();
    const {
        data: flowsData,
        error: flowsError,
        loading,
        refetch,
    } = useQuery(FlowsDocument, {
        notifyOnNetworkStatusChange: true,
    });

    const flows = useMemo(() => flowsData?.flows ?? [], [flowsData?.flows]);
    // Full-page spinner only while there's nothing to show yet: a background refetch
    // (reconnect sweep) keeps the rendered list, and a retry after a failed initial load
    // shows the spinner rather than flashing the "No flows found" empty state.
    const isLoading = loading && flows.length === 0;

    useSubscription(FlowCreatedDocument);
    useSubscription(FlowDeletedDocument);
    useSubscription(FlowUpdatedDocument);

    const [createFlowMutation] = useMutation(CreateFlowDocument);
    const [createAssistantMutation] = useMutation(CreateAssistantDocument);
    const [deleteFlowMutation] = useMutation(DeleteFlowDocument);
    const [finishFlowMutation] = useMutation(FinishFlowDocument);

    const createFlow = useCallback(
        async (values: FlowFormValues) => {
            const { message, providerName, resourceIds } = values;

            const input = message.trim();
            const modelProvider = providerName.trim();

            if (!input || !modelProvider) {
                return null;
            }

            try {
                const { data } = await createFlowMutation({
                    variables: {
                        input,
                        modelProvider,
                        resourceIds: resourceIds?.length ? resourceIds : undefined,
                    },
                });

                if (data?.createFlow?.id) {
                    return data.createFlow.id;
                }

                return null;
            } catch (error) {
                const description = error instanceof Error ? error.message : t('flows.provider.createFlowError');
                toast.error(t('flows.provider.createFlowFailed'), {
                    description,
                });
                Log.error('Error creating flow:', error);

                return null;
            }
        },
        [createFlowMutation, t],
    );

    const createFlowWithAssistant = useCallback(
        async (values: FlowFormValues) => {
            const { message, providerName, resourceIds, useAgents } = values;

            const input = message.trim();
            const modelProvider = providerName.trim();

            if (!input || !modelProvider) {
                return null;
            }

            try {
                const { data } = await createAssistantMutation({
                    variables: {
                        flowId: '0',
                        input,
                        modelProvider,
                        resourceIds: resourceIds?.length ? resourceIds : undefined,
                        useAgents,
                    },
                });

                if (data?.createAssistant?.flow?.id) {
                    return data.createAssistant.flow.id;
                }

                return null;
            } catch (error) {
                const description = error instanceof Error ? error.message : t('flows.provider.createAssistantError');
                toast.error(t('flows.provider.createAssistantFailed'), {
                    description,
                });
                Log.error('Error creating assistant:', error);

                return null;
            }
        },
        [createAssistantMutation, t],
    );

    const deleteFlow = useCallback(
        async (flow: Flow) => {
            const { id: flowId, title } = flow;

            if (!flowId) {
                return false;
            }

            const flowDescription = `${title || t('flows.provider.unknownTitle')} (ID: ${flowId})`;

            const loadingToastId = toast.loading(t('flows.provider.delete.loading'), {
                description: flowDescription,
            });

            try {
                await deleteFlowMutation({
                    variables: { flowId },
                });

                toast.success(t('flows.provider.delete.success'), {
                    description: flowDescription,
                    id: loadingToastId,
                });

                return true;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : t('flows.provider.delete.error');
                toast.error(errorMessage, {
                    description: flowDescription,
                    id: loadingToastId,
                });
                Log.error('Error deleting flow:', error);

                return false;
            }
        },
        [deleteFlowMutation, t],
    );

    const finishFlow = useCallback(
        async (flow: Flow) => {
            const { id: flowId, title } = flow;

            if (!flowId) {
                return false;
            }

            const flowDescription = `${title || t('flows.provider.unknownTitle')} (ID: ${flowId})`;

            const loadingToastId = toast.loading(t('flows.provider.finish.loading'), {
                description: flowDescription,
            });

            try {
                await finishFlowMutation({
                    variables: { flowId },
                });

                toast.success(t('flows.provider.finish.success'), {
                    description: flowDescription,
                    id: loadingToastId,
                });

                return true;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : t('flows.provider.finish.error');
                toast.error(errorMessage, {
                    description: flowDescription,
                    id: loadingToastId,
                });
                Log.error('Error finishing flow:', error);

                return false;
            }
        },
        [finishFlowMutation, t],
    );

    const value = useMemo(
        () => ({
            createFlow,
            createFlowWithAssistant,
            deleteFlow,
            finishFlow,
            flows,
            flowsData,
            flowsError,
            isLoading,
            refetch,
        }),
        [createFlow, createFlowWithAssistant, deleteFlow, finishFlow, flows, flowsData, flowsError, isLoading, refetch],
    );

    return <FlowsContext.Provider value={value}>{children}</FlowsContext.Provider>;
}

export function useFlows() {
    const context = useContext(FlowsContext);

    if (context === undefined) {
        throw new Error('useFlows must be used within FlowsProvider');
    }

    return context;
}
