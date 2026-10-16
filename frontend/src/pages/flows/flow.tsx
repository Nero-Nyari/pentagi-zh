import type { ReactNode } from 'react';

import { useMutation } from '@apollo/client/react';
import {
    ChevronDown,
    Copy,
    Download,
    Ellipsis,
    ExternalLink,
    GitFork,
    GripVertical,
    NotepadText,
    Pause,
    PencilLine,
    Star,
    Trash,
} from 'lucide-react';
import { startTransition, useCallback, useEffect, useOptimistic, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { Translator } from '@/lib/i18n/types';

import { FlowStatusIcon } from '@/components/icons/flow-status-icon';
import { ProviderIcon } from '@/components/icons/provider-icon';
import { AppHeader, AppHeaderAction, AppHeaderActions, AppHeaderContent } from '@/components/layouts/app/app-header';
import ConfirmationDialog from '@/components/shared/confirmation-dialog';
import {
    DetailNavigationButtons,
    DetailNavigationSheet,
    DetailNavigationToolbar,
} from '@/components/shared/detail-navigation';
import { ErrorState } from '@/components/shared/error-state';
import { InlineEditInput, useInlineEdit } from '@/components/shared/inline-edit';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import FlowCentralTabs from '@/features/flows/flow-central-tabs';
import { flowStatusLabelKeys } from '@/features/flows/flow-status-label';
import FlowTabs from '@/features/flows/flow-tabs';
import { useFlowDetailNavigation } from '@/features/flows/use-flow-detail-navigation';
import { RenameFlowDocument, ResultType, StatusType } from '@/graphql/types';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { FLOW_TAB_VALUES, useFlowSideTab, useFlowTabDetection } from '@/hooks/use-flow-tab-detection';
import { useIsOwnFlow } from '@/hooks/use-is-own-flow';
import { useTranslation } from '@/hooks/use-translation';
import { copyToClipboard } from '@/lib/clipboard';
import { Log } from '@/lib/log';
import { downloadTextFile, generateFileName, generateReport } from '@/lib/report';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { formatName } from '@/lib/utils/format';
import { isProviderMissing } from '@/models/provider';
import { useFavorites } from '@/providers/favorites-provider';
import { useFlow } from '@/providers/flow-provider';
import { type Flow as FlowItem, useFlows } from '@/providers/flows-provider';
import { useProviders } from '@/providers/providers-provider';

const renderFlowItem = (t: Translator, item: FlowItem, isCurrent: boolean): ReactNode => (
    <>
        <FlowStatusIcon
            className="size-3 shrink-0"
            status={item.status}
        />
        <span className={cn('min-w-0 flex-1 truncate', isCurrent && 'font-medium')}>
            {item.title || t('flows.detail.fallbackTitle', { id: item.id })}
        </span>
        <Badge
            className="ml-auto shrink-0 font-mono text-[10px]"
            variant="outline"
        >
            #{item.id}
        </Badge>
    </>
);

function Flow() {
    const { t } = useTranslation();
    const { isDesktop, isMobile } = useBreakpoint();
    const navigate = useNavigate();

    const { flowData, flowId, flowLoadError, isFlowMissing, isLoading: isFlowLoading, refetchFlow } = useFlow();
    const { deleteFlow, finishFlow, flows } = useFlows();
    const { canToggleFavorite, isFavoriteFlow, isLoading: isFavoritesLoading, toggleFavoriteFlow } = useFavorites();

    const flow = flowData?.flow;
    const { providers } = useProviders();
    const isOwnFlow = useIsOwnFlow();
    const isProviderGone = !!flow && isOwnFlow(flow) && isProviderMissing(flow.provider, providers);
    const providerName = flow ? formatName(flow.provider.name) : '';
    // 供应商缺失时在名称后追加“(不可用)”提示，名称本身是运行时数据需作为插值传入。
    const providerTooltip = isProviderGone
        ? t('flows.detail.providerUnavailable', { name: providerName })
        : providerName;
    const actualFlowTitle = flow?.title ?? '';
    const [flowTitle, setOptimisticFlowTitle] = useOptimistic(actualFlowTitle, (_current, next: string) => next);
    const isFlowRunning = flow ? ![StatusType.Failed, StatusType.Finished].includes(flow.status) : false;
    const isFavoriteToggleable = !!flow && canToggleFavorite(flow);
    const favoriteSubject = flow ?? (isFlowLoading ? flows.find(({ id }) => String(id) === flowId) : undefined);
    const isFavoriteSlotShown = favoriteSubject
        ? isFavoritesLoading || canToggleFavorite(favoriteSubject)
        : isFlowLoading;

    const flowNav = useFlowDetailNavigation(flowId);

    const {
        handleDropdownCloseAutoFocus,
        inputRef: editingInputRef,
        isEditing: isEditingTitle,
        startEdit: handleFlowRenameStart,
        stopEdit: handleFlowRenameCancel,
    } = useInlineEdit({ resetKey: flowId });

    const [isFinishing, setIsFinishing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [renameFlowMutation, { loading: isRenameLoading }] = useMutation(RenameFlowDocument);

    useEffect(() => {
        if (isFlowMissing) {
            navigate(routes.flows, { replace: true });
        }
    }, [isFlowMissing, navigate]);

    const handleFlowRenameSave = useCallback(async () => {
        const newTitle = editingInputRef.current?.value.trim();

        if (!flowId || !newTitle) {
            return;
        }

        startTransition(async () => {
            setOptimisticFlowTitle(newTitle);

            try {
                const { data } = await renameFlowMutation({
                    variables: {
                        flowId,
                        title: newTitle,
                    },
                });

                if (data?.renameFlow === ResultType.Success) {
                    toast.success(t('flows.list.rename.success'));
                    handleFlowRenameCancel();
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : t('flows.list.rename.failed');
                toast.error(errorMessage);
            }
        });
    }, [editingInputRef, flowId, handleFlowRenameCancel, renameFlowMutation, setOptimisticFlowTitle, t]);

    const handleFlowFinish = useCallback(async () => {
        if (!flow) {
            return;
        }

        setIsFinishing(true);

        try {
            await finishFlow(flow);
        } finally {
            setIsFinishing(false);
        }
    }, [flow, finishFlow]);

    const handleFlowDelete = useCallback(async () => {
        if (!flow) {
            return;
        }

        setIsDeleting(true);

        try {
            const success = await deleteFlow(flow);

            if (success) {
                navigate(routes.flows, { replace: true });
            }
        } finally {
            setIsDeleting(false);
        }
    }, [flow, deleteFlow, navigate]);

    const { handleTabChange: handleSideTabChange, resolvedTab: sideTab } = useFlowSideTab();
    const { handleTabChange: handleMobileTabChange, resolvedTab: mobileAutoTab } = useFlowTabDetection(FLOW_TAB_VALUES);

    const activeTabsTab = isDesktop ? sideTab : mobileAutoTab;
    const handleTabsTabChange = isDesktop ? handleSideTabChange : handleMobileTabChange;

    if (flowLoadError) {
        return (
            <>
                <AppHeader>
                    <AppHeaderContent>
                        <Breadcrumb className="min-w-0 flex-1">
                            <BreadcrumbList className="min-w-0 flex-nowrap">
                                <BreadcrumbItem className="min-w-0">
                                    <BreadcrumbPage>{t('flows.detail.breadcrumb')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </AppHeaderContent>
                </AppHeader>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <ErrorState
                        message={flowLoadError.message}
                        onRetry={refetchFlow}
                        title={t('flows.detail.error.title')}
                    />
                </div>
            </>
        );
    }

    const tabsCard = (
        <div className="flex h-[calc(100dvh-3rem)] max-w-full flex-col rounded-none border-0">
            <div className="flex-1 overflow-auto py-4 pr-0 pl-4">
                <FlowTabs
                    activeTab={activeTabsTab}
                    onTabChange={handleTabsTabChange}
                />
            </div>
        </div>
    );

    return (
        <>
            <AppHeader>
                <AppHeaderContent>
                    <Breadcrumb className="min-w-0 flex-1">
                        <BreadcrumbList className="min-w-0 flex-nowrap">
                            <BreadcrumbItem className="min-w-0 gap-2">
                                {flow && (
                                    <>
                                        <FlowStatusIcon
                                            status={flow.status}
                                            tooltip={t(flowStatusLabelKeys[flow.status])}
                                        />

                                        <ProviderIcon
                                            className={cn('size-4', isProviderGone && 'opacity-50')}
                                            provider={flow.provider}
                                            tooltip={providerTooltip}
                                        />
                                    </>
                                )}
                                {isEditingTitle && flow ? (
                                    <InlineEditInput
                                        busy={isRenameLoading}
                                        className="w-64 max-w-full min-w-0 flex-1"
                                        defaultValue={flowTitle}
                                        inputRef={editingInputRef}
                                        onCancel={handleFlowRenameCancel}
                                        onSave={handleFlowRenameSave}
                                        placeholder={t('flows.detail.titlePlaceholder')}
                                    />
                                ) : flow ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <BreadcrumbPage
                                                className="max-w-64 min-w-0 cursor-text truncate select-none"
                                                onDoubleClick={handleFlowRenameStart}
                                            >
                                                {flowTitle || t('flows.detail.selectFlow')}
                                            </BreadcrumbPage>
                                        </TooltipTrigger>
                                        <TooltipContent>{t('flows.detail.renameTooltip')}</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <BreadcrumbPage className="min-w-0 truncate">
                                        {flowTitle || t('flows.detail.selectFlow')}
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </AppHeaderContent>
                <AppHeaderActions>
                    {!!(flowData?.tasks ?? [])?.length && <FlowReportDropdown />}
                    {!isMobile && (
                        <DetailNavigationToolbar<FlowItem>
                            controller={flowNav}
                            renderItem={(item, isCurrent) => renderFlowItem(t, item, isCurrent)}
                            sheetIcon={<GitFork className="size-4" />}
                            sheetTitle={t('flows.list.title')}
                        />
                    )}
                    {flowId && !isMobile && isFavoriteSlotShown && (
                        <Button
                            aria-label={t('flows.list.aria.toggleFavorite')}
                            aria-pressed={isFavoriteFlow(flowId)}
                            className="shrink-0"
                            disabled={!isFavoriteToggleable}
                            onClick={() => toggleFavoriteFlow(flowId)}
                            size="icon"
                            variant="ghost"
                        >
                            <Star className={isFavoriteFlow(flowId) ? 'fill-yellow-500 stroke-yellow-500' : ''} />
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                aria-label={t('flows.detail.aria.actions')}
                                className="size-8 p-0"
                                variant="ghost"
                            >
                                <Ellipsis />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="min-w-24"
                            onCloseAutoFocus={handleDropdownCloseAutoFocus}
                        >
                            {isMobile && (
                                <>
                                    {/* onSelect={preventDefault} stops the Radix menu from closing on label
                                                clicks; DetailNavigationButtons owns its own click handlers. */}
                                    <DropdownMenuItem
                                        className="cursor-default hover:bg-transparent focus:bg-transparent"
                                        onSelect={(event) => event.preventDefault()}
                                    >
                                        <GitFork />
                                        {t('flows.list.title')}
                                        <div className="-my-1.5 -mr-2 ml-auto flex items-center">
                                            <DetailNavigationButtons<FlowItem>
                                                controller={flowNav}
                                                sheetTitle={t('flows.list.title')}
                                                size="sm"
                                            />
                                        </div>
                                    </DropdownMenuItem>
                                    {flowId && flow && canToggleFavorite(flow) && (
                                        <DropdownMenuItem
                                            disabled={isFlowLoading}
                                            onClick={() => toggleFavoriteFlow(flowId)}
                                        >
                                            <Star
                                                className={
                                                    isFavoriteFlow(flowId)
                                                        ? 'size-4 fill-yellow-500 stroke-yellow-500'
                                                        : 'size-4'
                                                }
                                            />
                                            {isFavoriteFlow(flowId)
                                                ? t('flows.detail.favorite.remove')
                                                : t('flows.detail.favorite.add')}
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem
                                disabled={isFlowLoading}
                                onClick={handleFlowRenameStart}
                            >
                                <PencilLine className="size-3" />
                                {t('flows.detail.action.rename')}
                            </DropdownMenuItem>
                            {isFlowRunning && (
                                <DropdownMenuItem
                                    disabled={isFinishing}
                                    onClick={() => handleFlowFinish()}
                                >
                                    {isFinishing ? (
                                        <>
                                            <Spinner variant="circle" />
                                            {t('flows.detail.action.finishing')}
                                        </>
                                    ) : (
                                        <>
                                            <Pause />
                                            {t('flows.detail.action.finish')}
                                        </>
                                    )}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                disabled={isDeleting || isFlowLoading}
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                {isDeleting ? (
                                    <>
                                        <Spinner variant="circle" />
                                        {t('flows.detail.action.deleting')}
                                    </>
                                ) : (
                                    <>
                                        <Trash />
                                        {t('flows.common.delete')}
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </AppHeaderActions>
            </AppHeader>
            {isMobile && (
                <DetailNavigationSheet<FlowItem>
                    controller={flowNav}
                    renderItem={(item, isCurrent) => renderFlowItem(t, item, isCurrent)}
                    sheetIcon={<GitFork className="size-4" />}
                    sheetTitle={t('flows.list.title')}
                />
            )}
            <div className="relative flex h-[calc(100dvh-3rem)] w-full max-w-full flex-1">
                {isFlowLoading && (
                    <div className="bg-background/50 absolute inset-0 z-50 flex items-center justify-center">
                        <Spinner
                            className="size-16"
                            variant="circle"
                        />
                    </div>
                )}
                {isDesktop ? (
                    <ResizablePanelGroup
                        className="w-full"
                        orientation="horizontal"
                    >
                        <ResizablePanel
                            defaultSize="50%"
                            minSize={390}
                        >
                            <div className="flex h-[calc(100dvh-3rem)] max-w-full flex-col rounded-none border-0">
                                <div className="flex-1 overflow-auto py-4 pr-0 pl-4">
                                    <FlowCentralTabs />
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle>
                            <GripVertical className="size-4" />
                        </ResizableHandle>
                        <ResizablePanel
                            defaultSize="50%"
                            minSize={390}
                        >
                            {tabsCard}
                        </ResizablePanel>
                    </ResizablePanelGroup>
                ) : (
                    tabsCard
                )}
            </div>
            <ConfirmationDialog
                cancelText={t('flows.common.cancel')}
                confirmText={t('flows.common.delete')}
                handleConfirm={handleFlowDelete}
                handleOpenChange={setIsDeleteDialogOpen}
                isOpen={isDeleteDialogOpen}
                itemName={flow?.title}
                itemType={t('flows.confirm.flow')}
            />
        </>
    );
}

function FlowReportDropdown() {
    const { t } = useTranslation();
    const { flowData, flowId } = useFlow();
    const flow = flowData?.flow;
    const tasks = flowData?.tasks ?? [];

    const isReportDisabled = !flow || !flowId;

    const handleCopyToClipboard = async () => {
        if (isReportDisabled) {
            return;
        }

        const reportContent = generateReport(tasks, flow, t);
        const success = await copyToClipboard(reportContent);

        if (success) {
            toast.success(t('flows.detail.report.copied'));
        } else {
            Log.error('Failed to copy report to clipboard');
            toast.error(t('flows.detail.report.copyFailed'));
        }
    };

    const handleDownloadMD = () => {
        if (isReportDisabled || !flow) {
            return;
        }

        try {
            const reportContent = generateReport(tasks, flow, t);

            const baseFileName = generateFileName(flow);
            const fileName = `${baseFileName}.md`;

            downloadTextFile(reportContent, fileName, 'text/markdown; charset=UTF-8');
        } catch (error) {
            Log.error('Failed to download markdown report:', error);
        }
    };

    const handleDownloadPDF = () => {
        if (isReportDisabled || !flow || !flowId) {
            return;
        }

        const url = `${routes.flowReport(flowId)}?download=true&silent=true`;
        window.open(url, '_blank');
    };

    const handleOpenWebView = () => {
        if (isReportDisabled || !flowId) {
            return;
        }

        const url = routes.flowReport(flowId);
        window.open(url, '_blank');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <AppHeaderAction
                    className="shrink-0"
                    disabled={isReportDisabled}
                    endIcon={<ChevronDown className="opacity-50" />}
                    icon={<NotepadText />}
                    label={t('flows.detail.report.label')}
                    variant="ghost"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={isReportDisabled}
                    onClick={handleOpenWebView}
                >
                    <ExternalLink />
                    {t('flows.detail.report.openWeb')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={isReportDisabled}
                    onClick={handleCopyToClipboard}
                >
                    <Copy />
                    {t('flows.detail.report.copy')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={isReportDisabled}
                    onClick={handleDownloadMD}
                >
                    <Download />
                    {t('flows.detail.report.downloadMd')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={isReportDisabled}
                    onClick={handleDownloadPDF}
                >
                    <Download />
                    {t('flows.detail.report.downloadPdf')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default Flow;
