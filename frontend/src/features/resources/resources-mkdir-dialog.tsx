import { FolderPlus } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSubmitButton } from '@/components/ui/form-submit-button';
import { Input } from '@/components/ui/input';
import { useAppForm } from '@/hooks/use-app-form';
import { useTranslation } from '@/hooks/use-translation';

import {
    createResourcesMkdirFormSchema,
    type ResourcesMkdirFormValues,
    useResourcesMkdir,
} from './use-resources-mkdir';

interface ResourcesMkdirDialogFormProps {
    defaultParentPath: string;
    onClose: () => void;
}

interface ResourcesMkdirDialogProps {
    /** Pre-filled parent path (without leading "/"). Empty string targets the root. */
    defaultParentPath?: string;
    isOpen: boolean;
    onClose: () => void;
}

const buildDefaultPath = (defaultParentPath: string): string =>
    defaultParentPath ? `${defaultParentPath.replace(/\/+$/u, '')}/new-folder` : 'new-folder';

export function ResourcesMkdirDialog({ defaultParentPath = '', isOpen, onClose }: ResourcesMkdirDialogProps) {
    const handleDialogOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            onClose();
        }
    };

    return (
        <Dialog
            onOpenChange={handleDialogOpenChange}
            open={isOpen}
        >
            {isOpen && (
                <ResourcesMkdirDialogForm
                    defaultParentPath={defaultParentPath}
                    onClose={onClose}
                />
            )}
        </Dialog>
    );
}

function ResourcesMkdirDialogForm({ defaultParentPath, onClose }: ResourcesMkdirDialogFormProps) {
    const { t } = useTranslation();
    const { isCreating, mkdir } = useResourcesMkdir();

    const localSchema = useMemo(() => createResourcesMkdirFormSchema(t), [t]);

    const form = useAppForm<ResourcesMkdirFormValues>({
        defaultValues: { path: buildDefaultPath(defaultParentPath) },
        schema: localSchema,
    });

    useEffect(() => {
        form.reset({ path: buildDefaultPath(defaultParentPath) });
    }, [defaultParentPath, form]);

    const handleSubmit = form.handleSubmit(async (values) => {
        const wasCreated = await mkdir(values);

        if (wasCreated) {
            onClose();
        }
    });

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <FolderPlus className="size-4" />
                    {t('resources.mkdirDialog.title')}
                </DialogTitle>
                <DialogDescription>{t('resources.mkdirDialog.description')}</DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form
                    className="flex flex-col gap-4"
                    noValidate
                    onSubmit={handleSubmit}
                >
                    <FormField
                        control={form.control}
                        name="path"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('resources.mkdirDialog.path')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        autoComplete="off"
                                        autoFocus
                                        disabled={isCreating}
                                        placeholder={t('resources.mkdirDialog.placeholder')}
                                    />
                                </FormControl>
                                <FormDescription>
                                    {t('resources.mkdirDialog.helpPrefix')} <code>/</code>{' '}
                                    {t('resources.mkdirDialog.helpSuffix')}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            disabled={isCreating}
                            onClick={onClose}
                            type="button"
                            variant="outline"
                        >
                            {t('shared.confirmDialog.cancel')}
                        </Button>
                        <FormSubmitButton icon={<FolderPlus />}>{t('resources.mkdirDialog.create')}</FormSubmitButton>
                    </div>
                </form>
            </Form>
        </DialogContent>
    );
}
