import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import type { TranslationKey, Translator } from '@/lib/i18n/types';
import type { OAuthProvider } from '@/providers/user-provider';

import Github from '@/components/icons/github';
import Google from '@/components/icons/google';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSubmitButton } from '@/components/ui/form-submit-button';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { useAppForm } from '@/hooks/use-app-form';
import { useTranslation } from '@/hooks/use-translation';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers/user-provider';

import { PasswordChangeForm } from './password-change-form';

// 校验消息随语言变化，因此 schema 由 t 工厂生成，而不是模块级常量。
const createFormSchema = (t: Translator) =>
    z.object({
        mail: z
            .string()
            .min(1, {
                message: t('auth.login.errors.loginRequired'),
            })
            .refine(
                (value) =>
                    z.string().email().safeParse(value).success || ['admin', 'demo'].includes(value.toLowerCase()),
                {
                    message: t('auth.login.errors.invalidLogin'),
                },
            ),
        password: z.string().min(1, {
            message: t('auth.login.errors.passwordRequired'),
        }),
    });

interface AuthProviderAction {
    icon: React.ReactNode;
    id: OAuthProvider;
    /** 模块级常量只存键，渲染时再按当前语言取文案。 */
    nameKey: TranslationKey;
}

type LoginFormValues = z.infer<ReturnType<typeof createFormSchema>>;

const providerActions: AuthProviderAction[] = [
    {
        icon: <Google className="size-5" />,
        id: 'google',
        nameKey: 'auth.login.continueWithGoogle',
    },
    {
        icon: <Github className="size-5" />,
        id: 'github',
        nameKey: 'auth.login.continueWithGitHub',
    },
];

interface LoginFormProps {
    providers: string[];
    returnUrl?: string;
}

function LoginForm({ providers, returnUrl = routes.newFlow }: LoginFormProps) {
    const { t } = useTranslation();
    const formSchema = useMemo(() => createFormSchema(t), [t]);
    const form = useAppForm<LoginFormValues>({
        defaultValues: {
            mail: '',
            password: '',
        },
        schema: formSchema,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
    const navigate = useNavigate();
    const { authInfo, isAuthenticated, login, loginWithOAuth, setAuth } = useUser();

    const errorMessage = t('auth.login.errors.invalidCredentials');
    const errorProviderMessage = t('auth.login.errors.authFailed');

    const handleSubmit = async (values: LoginFormValues) => {
        setError(null);

        try {
            const result = await login(values);

            if (!result.success) {
                setError(result.error || errorMessage);

                return;
            }

            if (result.passwordChangeRequired) {
                setPasswordChangeRequired(true);

                return;
            }

            navigate(returnUrl);
        } catch {
            setError(errorMessage);
        }
    };

    const handleProviderLogin = async (provider: OAuthProvider) => {
        setError(null);
        setIsSubmitting(true);

        try {
            const result = await loginWithOAuth(provider);

            if (!result.success) {
                setError(result.error || errorProviderMessage);

                return;
            }

            navigate(returnUrl);
        } catch (error) {
            setError(error instanceof Error ? error.message : errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipPasswordChange = () => {
        navigate(returnUrl);
    };

    const handlePasswordChangeSuccess = () => {
        if (authInfo?.user) {
            const updatedAuthData = {
                ...authInfo,
                user: {
                    ...authInfo.user,
                    password_change_required: false,
                },
            };

            setAuth(updatedAuthData);
            navigate(returnUrl);
        }
    };

    // If the session expired and user refreshed the page, the old authInfo may still
    // be in memory (race condition between clearAuth() and navigate()), but we must
    // NOT show the password change form because:
    //   1. The API endpoint /user/password requires authentication (returns 403 if not)
    //   2. The user must first re-login to establish a new valid session
    // Also check authInfo directly to handle page refresh scenarios where passwordChangeRequired
    // local state is lost but authInfo.user.password_change_required is still true.
    const shouldShowPasswordChange =
        (passwordChangeRequired || authInfo?.user?.password_change_required) &&
        authInfo?.user?.type === 'local' &&
        isAuthenticated();

    if (shouldShowPasswordChange) {
        return (
            <div className="mx-auto flex w-[350px] flex-col gap-6">
                <h1 className="text-center text-3xl font-bold">{t('auth.password.change.requiredTitle')}</h1>
                <p className="text-muted-foreground text-center text-sm">
                    {t('auth.password.change.requiredDescription')}
                </p>
                <PasswordChangeForm
                    layout="vertical"
                    onSkip={handleSkipPasswordChange}
                    onSuccess={handlePasswordChangeSuccess}
                />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form
                className="mx-auto grid w-[350px] gap-8"
                noValidate
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <h1 className="text-center text-3xl font-bold">PentAGI</h1>

                {providers?.length > 0 && (
                    <>
                        <div className="flex flex-col gap-4">
                            {providerActions
                                .filter((provider) => providers.includes(provider.id))
                                .map((provider) => (
                                    <Button
                                        disabled={isSubmitting || form.formState.isSubmitting}
                                        key={provider.id}
                                        onClick={() => handleProviderLogin(provider.id)}
                                        type="button"
                                        variant="secondary"
                                    >
                                        {provider.icon}
                                        {t(provider.nameKey)}
                                    </Button>
                                ))}
                        </div>

                        <div className="relative -mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-background px-2">{t('auth.login.or')}</span>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex flex-col gap-4">
                    <FormField
                        control={form.control}
                        name="mail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('auth.login.label')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        autoFocus
                                        placeholder={t('auth.login.placeholder')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('auth.login.passwordLabel')}</FormLabel>
                                <FormControl>
                                    <InputPassword
                                        {...field}
                                        placeholder={t('auth.login.passwordPlaceholder')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormSubmitButton className="w-full">
                        <span>{t('auth.login.submit')}</span>
                    </FormSubmitButton>

                    {error && <FormMessage>{error}</FormMessage>}
                </div>
            </form>
        </Form>
    );
}

export default LoginForm;
