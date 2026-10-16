import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

import type { Translator } from '@/lib/i18n/types';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSubmitButton } from '@/components/ui/form-submit-button';
import { Input } from '@/components/ui/input';
import { useAppForm } from '@/hooks/use-app-form';
import { useTranslation } from '@/hooks/use-translation';
import { api, resolveApiErrorMessage } from '@/lib/axios';
import { useUser } from '@/providers/user-provider';

// 校验消息随语言变化，因此 schema 由 t 工厂生成，而不是模块级常量。
const createNameChangeFormSchema = (t: Translator) =>
    z.object({
        name: z
            .string()
            .trim()
            .min(1, { message: t('auth.name.change.errors.required') })
            .max(70, { message: t('auth.name.change.errors.maxLength') }),
    });

// 后端错误码到文案的映射同样依赖语言，改为按当前翻译器构造。
const errorByCode = (t: Translator): Record<string, string> => ({
    'Users.ChangeNameCurrentUser.InvalidName': t('auth.name.change.errors.invalid'),
    'Users.NotFound': t('auth.form.errors.userNotFound'),
});

interface NameChangeFormProps {
    onCancel?: () => void;
    onSuccess?: () => void;
}

type NameChangeFormValues = z.infer<ReturnType<typeof createNameChangeFormSchema>>;

export function NameChangeForm({ onCancel, onSuccess }: NameChangeFormProps) {
    const { t } = useTranslation();
    const [error, setError] = useState<null | string>(null);
    const { authInfo, patchUser, refreshAuthInfo } = useUser();

    const formSchema = useMemo(() => createNameChangeFormSchema(t), [t]);
    const form = useAppForm<NameChangeFormValues>({
        defaultValues: {
            name: authInfo?.user?.name ?? '',
        },
        schema: formSchema,
    });

    const handleSubmit = async (values: NameChangeFormValues) => {
        setError(null);

        try {
            await api.put('/user/name', { name: values.name });

            toast.success(t('auth.name.change.success'));

            patchUser({ name: values.name });
            await refreshAuthInfo();

            onSuccess?.();
        } catch (err: unknown) {
            setError(resolveApiErrorMessage(err, errorByCode(t), t('auth.name.change.failed')));
        }
    };

    return (
        <Form {...form}>
            <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('auth.name.change.label')}</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder={t('auth.name.change.placeholder')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {error && <div className="text-destructive text-sm">{error}</div>}

                <div className="flex justify-end gap-2 pt-2">
                    {onCancel && (
                        <Button
                            onClick={onCancel}
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            {t('auth.form.cancel')}
                        </Button>
                    )}
                    <FormSubmitButton size="sm">
                        <span>{t('auth.name.change.submit')}</span>
                    </FormSubmitButton>
                </div>
            </form>
        </Form>
    );
}
