import { ArrowDownToLine, FolderInput, FolderOutput, FolderUp, Search, Upload, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import ConfirmationDialog from '@/components/shared/confirmation-dialog';
import {
    bulkCopyPathsAction,
    bulkDeleteAction,
    bulkDownloadAction,
    bulkPromoteAction,
    copyPathAction,
    deleteAction,
    downloadAction,
    FileManager,
    type FileManagerAction,
    type FileManagerBulkAction,
    type FileManagerRootGroup,
    type FileNode,
} from '@/components/shared/file-manager';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { StatusType } from '@/graphql/types';
import { useFilesDragAndDrop } from '@/hooks/use-files-drag-and-drop';
import { useTranslation } from '@/hooks/use-translation';
import { copyToClipboard } from '@/lib/clipboard';
import { useFlow } from '@/providers/flow-provider';

import { FlowFilesAttachResourcesDialog } from './flow-files-attach-resources-dialog';
import { ROOT_GROUPS } from './flow-files-constants';
import { FlowFilesPromoteDialog } from './flow-files-promote-dialog';
import { FlowFilesPullDialog } from './flow-files-pull-dialog';
import { buildFlowFilesDownloadHref } from './flow-files-utils';
import { useFlowFilesData } from './use-flow-files-data';
import { useFlowFilesDelete } from './use-flow-files-delete';
import { useFlowFilesRealtime } from './use-flow-files-realtime';
import { useFlowFilesSearch } from './use-flow-files-search';
import { useFlowFilesUpload } from './use-flow-files-upload';

function FlowFiles() {
    const { t } = useTranslation();
    const { flowId, flowStatus } = useFlow();
    const [isPullDialogOpen, setIsPullDialogOpen] = useState(false);
    const [isAttachResourcesDialogOpen, setIsAttachResourcesDialogOpen] = useState(false);
    const [filesToPromote, setFilesToPromote] = useState<FileNode[] | null>(null);

    const { fileNodes, isInitialLoading, isLoading } = useFlowFilesData({ flowId });

    useFlowFilesRealtime({ flowId, isPaused: isLoading });

    const search = useFlowFilesSearch();
    const upload = useFlowFilesUpload({ flowId });
    const deletion = useFlowFilesDelete({ flowId });

    const canAcceptDrop = !!flowId && !upload.isUploading;
    const { dragHandlers, isDragging } = useFilesDragAndDrop({
        canAcceptDrop,
        onDrop: upload.uploadFiles,
    });

    const isContainerRunning = flowStatus === StatusType.Running || flowStatus === StatusType.Waiting;
    const isPullDisabled = !isContainerRunning || isLoading || upload.isUploading;

    const handleCopyPath = useCallback(
        async (file: FileNode) => {
            const wasCopied = await copyToClipboard(file.path);

            if (wasCopied) {
                toast.success(t('flows.files.toast.copyPath.success'));

                return;
            }

            toast.error(t('flows.files.toast.copyPath.failed'));
        },
        [t],
    );

    /**
     * Join the selected paths with `\n` so the result pastes as a clean
     * newline-separated list into the agent chat, a shell command, or a tool argument.
     */
    const handleBulkCopyPaths = useCallback(
        async (paths: string[]) => {
            if (paths.length === 0) {
                return;
            }

            const wasCopied = await copyToClipboard(paths.join('\n'));

            if (wasCopied) {
                toast.success(t('flows.files.toast.copyPaths.success', { count: paths.length }));

                return;
            }

            toast.error(t('flows.files.toast.copyPaths.failed'));
        },
        [t],
    );

    // `flowId` may be missing (no flow selected yet) — return '' so FileManager
    // renders a noop link instead of crashing on `null`.
    const getRowDownloadHref = useCallback(
        (file: FileNode): string => buildFlowFilesDownloadHref(flowId, [file]) ?? '',
        [flowId],
    );

    const getBulkDownloadHref = useCallback(
        (files: FileNode[]): string => buildFlowFilesDownloadHref(flowId, files) ?? '',
        [flowId],
    );

    const handleRequestPromote = useCallback((file: FileNode) => {
        setFilesToPromote([file]);
    }, []);

    const handleClosePromoteDialog = useCallback(() => setFilesToPromote(null), []);

    const rootGroups = useMemo<FileManagerRootGroup[]>(
        () => ROOT_GROUPS.map(({ labelKey, ...group }) => ({ ...group, label: t(labelKey) })),
        [t],
    );

    const promoteAction = useMemo<FileManagerAction>(
        () => ({
            appliesToDirs: true,
            icon: FolderOutput,
            id: 'flow-files-save-as-resource',
            label: t('flows.files.action.saveAsResource'),
            onSelect: handleRequestPromote,
        }),
        [handleRequestPromote, t],
    );

    const fileManagerActions = useMemo<FileManagerAction[]>(
        () => [
            downloadAction(getRowDownloadHref, { label: t('flows.files.action.download') }),
            copyPathAction(handleCopyPath, { label: t('flows.files.action.copyPath') }),
            promoteAction,
            deleteAction(deletion.requestDelete, { label: t('flows.files.action.delete') }),
        ],
        [deletion.requestDelete, getRowDownloadHref, handleCopyPath, promoteAction, t],
    );

    const fileManagerBulkActions = useMemo<FileManagerBulkAction[]>(
        () => [
            bulkDownloadAction(getBulkDownloadHref, { label: t('flows.files.action.download') }),
            bulkPromoteAction((files) => setFilesToPromote(files), { label: t('flows.files.action.saveAsResources') }),
            bulkCopyPathsAction(handleBulkCopyPaths, { label: t('flows.files.action.copyPaths') }),
            bulkDeleteAction(deletion.deleteFiles, {
                confirmDescription: (items) => t('flows.files.bulk.delete.description', { items }),
                confirmText: t('flows.common.delete'),
                confirmTitle: (items) => t('flows.files.bulk.delete.title', { items }),
                label: t('flows.files.action.delete'),
            }),
        ],
        [deletion.deleteFiles, getBulkDownloadHref, handleBulkCopyPaths, t],
    );

    const handleOpenPullDialog = useCallback(() => setIsPullDialogOpen(true), []);
    const handleClosePullDialog = useCallback(() => setIsPullDialogOpen(false), []);
    const handleOpenAttachResourcesDialog = useCallback(() => setIsAttachResourcesDialogOpen(true), []);
    const handleCloseAttachResourcesDialog = useCallback(() => setIsAttachResourcesDialogOpen(false), []);
    const handleDeleteDialogOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                deletion.clearFileToDelete();
            }
        },
        [deletion],
    );

    const isAttachResourcesDisabled = !flowId || isLoading || upload.isUploading;

    const noFilesState = (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FolderUp />
                </EmptyMedia>
                <EmptyTitle>{t('flows.files.empty.title')}</EmptyTitle>
                <EmptyDescription>
                    {t('flows.files.empty.pre')} <code>/work/uploads</code>
                    {t('flows.files.empty.post')}
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );

    const noMatchesState = (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Search />
                </EmptyMedia>
                <EmptyTitle>{t('flows.files.noMatches.title')}</EmptyTitle>
                <EmptyDescription>
                    {t('flows.files.noMatches.descriptionPre')} <code>{search.debouncedQuery.trim()}</code>
                    {t('flows.files.noMatches.descriptionPost')}
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );

    return (
        <div
            className="relative flex h-full flex-col"
            {...dragHandlers}
        >
            <input
                aria-hidden="true"
                className="hidden"
                key={upload.fileInputKey}
                multiple
                name="flow-file-upload"
                tabIndex={-1}
                type="file"
                {...upload.fileInputProps}
            />

            {isDragging && (
                <div className="bg-primary/10 border-primary pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-link flex flex-col items-center gap-2">
                        <FolderUp className="size-8" />
                        <span className="text-sm font-medium">{t('flows.files.dropHint')}</span>
                    </div>
                </div>
            )}

            <div className="bg-background sticky top-0 z-10 pb-4">
                <Form {...search.form}>
                    <div className="flex gap-2 p-px">
                        <FormField
                            control={search.form.control}
                            name="search"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <Search />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                {...field}
                                                autoComplete="off"
                                                placeholder={t('flows.files.search')}
                                                type="text"
                                            />
                                            {field.value && (
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupButton
                                                        aria-label={t('flows.files.clearSearch')}
                                                        onClick={search.resetSearch}
                                                        type="button"
                                                    >
                                                        <X />
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                            )}
                                        </InputGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        aria-label={t('flows.files.action.upload')}
                                        disabled={upload.isUploading || isLoading}
                                        onClick={upload.openFilePicker}
                                        size="icon-sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        {upload.isUploading ? <Spinner variant="circle" /> : <Upload />}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-64 text-center text-xs">
                                <p className="font-medium">{t('flows.files.action.upload')}</p>
                                <p className="mt-1">
                                    {t('flows.files.tooltip.uploadPre')} <code>/work/uploads</code>{' '}
                                    {t('flows.files.tooltip.immediatelyAvailable')}
                                </p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        aria-label={t('flows.files.action.attachResources')}
                                        disabled={isAttachResourcesDisabled}
                                        onClick={handleOpenAttachResourcesDialog}
                                        size="icon-sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        <FolderInput />
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-64 text-center text-xs">
                                <p className="font-medium">{t('flows.files.action.attachResources')}</p>
                                <p className="mt-1">
                                    {t('flows.files.tooltip.attachPre')} <code>/work/resources</code>{' '}
                                    {t('flows.files.tooltip.immediatelyAvailable')}
                                </p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        aria-label={t('flows.files.action.pullFromContainer')}
                                        disabled={isPullDisabled}
                                        onClick={handleOpenPullDialog}
                                        size="icon-sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        <ArrowDownToLine />
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-64 text-center text-xs">
                                {isContainerRunning ? (
                                    <>
                                        <p className="font-medium">{t('flows.files.tooltip.pull.title')}</p>
                                        <p className="mt-1">
                                            {t('flows.files.tooltip.pull.snapshotsPre')}{' '}
                                            <strong>{t('flows.files.root.container')}</strong>
                                            {t('flows.files.tooltip.pull.snapshotsPost')}
                                        </p>
                                    </>
                                ) : (
                                    <p className="font-medium">{t('flows.files.tooltip.pull.notRunning')}</p>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </Form>
            </div>

            <FileManager
                actions={fileManagerActions}
                bulkActions={fileManagerBulkActions}
                className="min-h-0 flex-1"
                emptyState={noFilesState}
                files={fileNodes}
                isLoading={isInitialLoading}
                rootGroups={rootGroups}
                search={{ emptyState: noMatchesState, query: search.debouncedQuery }}
            />

            <FlowFilesPullDialog
                cachedFiles={fileNodes}
                flowId={flowId}
                isOpen={isPullDialogOpen}
                onClose={handleClosePullDialog}
            />

            <FlowFilesAttachResourcesDialog
                cachedFiles={fileNodes}
                flowId={flowId}
                isOpen={isAttachResourcesDialogOpen}
                onClose={handleCloseAttachResourcesDialog}
            />

            <FlowFilesPromoteDialog
                files={filesToPromote}
                flowId={flowId}
                onClose={handleClosePromoteDialog}
            />

            <ConfirmationDialog
                confirmText={t('flows.common.delete')}
                handleConfirm={deletion.confirmDelete}
                handleOpenChange={handleDeleteDialogOpenChange}
                isOpen={!!deletion.fileToDelete}
                itemName={deletion.fileToDelete?.name}
                itemType={deletion.fileToDelete?.isDir ? t('flows.files.type.directory') : t('flows.files.type.file')}
                title={
                    deletion.fileToDelete?.isDir
                        ? t('flows.files.confirm.deleteDirectory')
                        : t('flows.files.confirm.deleteFile')
                }
            />
        </div>
    );
}

export default FlowFiles;
