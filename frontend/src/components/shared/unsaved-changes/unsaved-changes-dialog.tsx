import type { ReactNode } from 'react';

import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';

export interface UnsavedChangesDialogProps {
    /** When `false`, the "Save & leave" button is disabled (e.g. form is invalid). */
    canSave: boolean;
    description?: string;
    discardText?: string;
    handleCancel: () => void;
    handleDiscard: () => void;
    handleOpenChange: (open: boolean) => void;
    handleSaveAndLeave: () => Promise<void> | void;
    isOpen: boolean;
    isSavingFromDialog: boolean;
    /** Override the default `<Save />` icon next to the save button. */
    saveIcon?: ReactNode;
    saveText?: string;
    title?: string;
}

function UnsavedChangesDialog({
    canSave,
    description,
    discardText,
    handleCancel,
    handleDiscard,
    handleOpenChange,
    handleSaveAndLeave,
    isOpen,
    isSavingFromDialog,
    saveIcon = <Save />,
    saveText,
    title,
}: UnsavedChangesDialogProps) {
    const { t } = useTranslation();

    const resolvedTitle = title ?? t('shared.unsavedChanges.title');
    const resolvedDescription = description ?? t('shared.unsavedChanges.description');
    const resolvedDiscardText = discardText ?? t('shared.unsavedChanges.discard');
    const resolvedSaveText = saveText ?? t('shared.unsavedChanges.save');

    return (
        <Dialog
            onOpenChange={handleOpenChange}
            open={isOpen}
        >
            <DialogContent
                className="sm:max-w-md"
                onEscapeKeyDown={(event) => {
                    if (isSavingFromDialog) {
                        event.preventDefault();
                    }
                }}
                onInteractOutside={(event) => {
                    if (isSavingFromDialog) {
                        event.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>{resolvedTitle}</DialogTitle>
                    <DialogDescription>{resolvedDescription}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        disabled={isSavingFromDialog}
                        onClick={handleCancel}
                        variant="outline"
                    >
                        {t('shared.unsavedChanges.cancel')}
                    </Button>
                    <Button
                        disabled={isSavingFromDialog}
                        onClick={handleDiscard}
                        variant="destructive"
                    >
                        {resolvedDiscardText}
                    </Button>
                    <Button
                        disabled={isSavingFromDialog || !canSave}
                        onClick={() => {
                            void handleSaveAndLeave();
                        }}
                        variant="default"
                    >
                        {isSavingFromDialog ? <Spinner variant="circle" /> : saveIcon}
                        {resolvedSaveText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { UnsavedChangesDialog };
