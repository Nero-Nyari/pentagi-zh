import type { ReactElement } from 'react';

import { Trash2 } from 'lucide-react';
import { cloneElement, isValidElement, useState } from 'react';

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
import { cn } from '@/lib/utils';

type ConfirmationDialogIconProps = ReactElement<React.SVGProps<SVGSVGElement>>;

interface ConfirmationDialogProps {
    cancelIcon?: ConfirmationDialogIconProps;
    cancelText?: string;
    cancelVariant?: 'default' | 'destructive' | 'ghost' | 'outline' | 'secondary';
    confirmIcon?: ConfirmationDialogIconProps;
    confirmText?: string;
    confirmVariant?: 'default' | 'destructive' | 'ghost' | 'outline' | 'secondary';
    description?: string;
    /** May be sync or async. If async, the dialog keeps itself open and shows a spinner until the promise settles. */
    handleConfirm: () => Promise<void> | void;
    handleOpenChange: (isOpen: boolean) => void;
    isOpen: boolean;
    itemName?: string;
    itemType?: string;
    title?: string;
}

function ConfirmationDialog({
    cancelIcon,
    cancelText,
    cancelVariant = 'outline',
    confirmIcon = <Trash2 />,
    confirmText,
    confirmVariant = 'destructive',
    description,
    handleConfirm,
    handleOpenChange,
    isOpen,
    itemName,
    itemType,
    title,
}: ConfirmationDialogProps) {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);

    const resolvedCancelText = cancelText ?? t('shared.confirmDialog.cancel');
    const resolvedConfirmText = confirmText ?? t('shared.confirmDialog.confirm');
    const resolvedItemName = itemName ?? t('shared.confirmDialog.itemName');
    const resolvedItemType = itemType ?? t('shared.confirmDialog.itemType');

    // `verb !== defaultConfirm` treats the default confirmText as "no custom verb": a bare
    // Confirm gets the generic "Confirm Action" title instead of "Confirm <itemType>". Compared
    // against the translated default so a localized "Confirm" is still recognized as generic.
    const verb = resolvedConfirmText.trim();
    const resolvedTitle =
        title ??
        (verb && verb !== t('shared.confirmDialog.confirm')
            ? `${verb} ${resolvedItemType}`
            : t('shared.confirmDialog.confirmAction'));

    const defaultDescription = description || (
        <>
            {t('shared.confirmDialog.areYouSurePrefix', {
                action: verb.toLowerCase() || t('shared.confirmDialog.performAction'),
            })}{' '}
            <strong className="text-foreground font-semibold">{resolvedItemName}</strong>{' '}
            {t('shared.confirmDialog.areYouSureSuffix', { type: resolvedItemType })}
        </>
    );

    const processIcon = (icon?: ConfirmationDialogIconProps): ConfirmationDialogIconProps | null => {
        if (!icon) {
            return null;
        }

        if (isValidElement(icon)) {
            const { className = '', ...restProps } = icon.props;

            return cloneElement(icon, {
                ...restProps,
                className: cn('size-4', className),
            });
        }

        return icon;
    };

    const handleConfirmClick = async () => {
        if (isProcessing) {
            return;
        }

        setIsProcessing(true);

        try {
            await handleConfirm();
            handleOpenChange(false);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog
            onOpenChange={(nextOpen) => {
                if (isProcessing) {
                    return;
                }

                handleOpenChange(nextOpen);
            }}
            open={isOpen}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{resolvedTitle}</DialogTitle>
                    <DialogDescription>{defaultDescription}</DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        disabled={isProcessing}
                        onClick={() => handleOpenChange(false)}
                        variant={cancelVariant}
                    >
                        {processIcon(cancelIcon)}
                        {resolvedCancelText}
                    </Button>
                    <Button
                        disabled={isProcessing}
                        onClick={() => {
                            void handleConfirmClick();
                        }}
                        variant={confirmVariant}
                    >
                        {isProcessing ? <Spinner variant="circle" /> : processIcon(confirmIcon)}
                        {resolvedConfirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ConfirmationDialog;
