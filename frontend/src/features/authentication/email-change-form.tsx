import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

import type { Translator } from '@/lib/i18n/types';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSubmitButton } from '@/components/ui/form-submit-button';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { useAppForm } from '@/hooks/use-app-form';
import { useTranslation } from '@/hooks/use-translation';
import { api, resolveApiErrorMessage } from '@/lib/axios';
import { useUser } from '@/providers/user-provider';

// 校验消息随语言变化，因此 schema 由 t 工厂生成，而不是模块级常量。
const createEmailChangeFormSchema = (t: Translator) =>
    z.object({
        currentPassword: z.string().min(1, { message: t('auth.form.errors.currentPasswordRequired') }),
        newEmail: z
            .string()
            .trim()
            .toLowerCase()
            .min(1, { message: t('auth.email.change.errors.required') })
            .email({ message: t('auth.email.change.errors.invalid') })
            .max(50, { message: t('auth.email.change.errors.maxLength') }),
    });

// 后端错误码到文案的映射同样依赖语言，改为按当前翻译器构造。
const errorByCode = (t: Translator): Record<string, string> => ({
    'Users.ChangeEmailCurrentUser.EmailAlreadyExists': t('auth.email.change.errors.alreadyInUse'),
    'Users.ChangeEmailCurrentUser.InvalidCurrentPassword': t('auth.form.errors.currentPasswordIncorrect'),
    'Users.ChangeEmailCurrentUser.InvalidEmail': t('auth.email.change.errors.invalidEmail'),
    'Users.NotFound': t('auth.form.errors.userNotFound'),
});

interface EmailChangeFormProps {
    onCancel?: () => void;
    onSuccess?: () => void;
}

type EmailChangeFormValues = z.infer<ReturnType<typeof createEmailChangeFormSchema>>;

export function EmailChangeForm({ onCancel, onSuccess }: EmailChangeFormProps) {
    const { t } = useTranslation();
    const [error, setError] = useState<null | string>(null);
    const { patchUser, refreshAuthInfo } = useUser();

    const formSchema = useMemo(() => createEmailChangeFormSchema(t), [t]);
    const form = useAppForm<EmailChangeFormValues>({
        defaultValues: {
            currentPassword: '',
            newEmail: '',
        },
        schema: formSchema,
    });

    const handleSubmit = async (values: EmailChangeFormValues) => {
        setError(null);

        try {
            await api.put('/user/email', {
                current_password: values.currentPassword,
                mail: values.newEmail,
            });

            form.reset();
            toast.success(t('auth.email.change.success'));

            patchUser({ mail: values.newEmail });
            await refreshAuthInfo();

            onSuccess?.();
        } catch (err: unknown) {
            setError(resolveApiErrorMessage(err, errorByCode(t), t('auth.email.change.failed')));
        }
    };

    return (
        <Form {...form}>
            {/* noValidate: the type="email" field would otherwise fire the browser's native (locale-styled)
                validation popup on submit, pre-empting our zod message. Validation runs through zod instead. */}
            <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('auth.form.currentPasswordLabel')}</FormLabel>
                            <FormControl>
                                <InputPassword
                                    {...field}
                                    placeholder={t('auth.form.currentPasswordPlaceholder')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="newEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('auth.email.change.newLabel')}</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder={t('auth.email.change.newPlaceholder')}
                                    type="email"
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
                        <span>{t('auth.email.change.submit')}</span>
                    </FormSubmitButton>
                </div>
            </form>
        </Form>
    );
}
