import type { ReactNode } from 'react';

import { ArrowLeft, FileText, Key, Plug, Settings as SettingsIcon, User } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import type { TranslationKey } from '@/lib/i18n/types';

import { VersionPanel } from '@/components/shared/version-panel';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/use-translation';
import { routes } from '@/lib/routes';
import { getSafeReturnUrl } from '@/lib/utils/auth';

interface MenuItem {
    icon?: ReactNode;
    id: string;
    path: string;
    /**
     * A key rather than the label itself: this list is built at module scope,
     * before any language is known, and has to be re-resolved per render so a
     * switch repaints it.
     */
    titleKey: TranslationKey;
}

interface SettingsSidebarMenuItemProps {
    item: MenuItem;
}

const menuItems: readonly MenuItem[] = [
    {
        icon: <User className="size-4" />,
        id: 'account',
        path: routes.settings.account,
        titleKey: 'nav.account',
    },
    {
        icon: <Plug className="size-4" />,
        id: 'providers',
        path: routes.settings.providers,
        titleKey: 'nav.providers',
    },
    {
        icon: <FileText className="size-4" />,
        id: 'prompts',
        path: routes.settings.prompts,
        titleKey: 'nav.prompts',
    },
    {
        icon: <Key className="size-4" />,
        id: 'api-tokens',
        path: routes.settings.apiTokens,
        titleKey: 'nav.apiTokens',
    },
] as const;

export function SettingsSidebar() {
    const location = useLocation();
    const { t } = useTranslation();
    const [returnUrl] = useState(() =>
        getSafeReturnUrl((location.state as null | { from?: string })?.from ?? null, routes.flows),
    );

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <VersionPanel
                            icon={
                                <SettingsIcon
                                    className="size-8"
                                    strokeWidth={4 / 3}
                                />
                            }
                            title={t('nav.settings')}
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SettingsSidebarMenuItem
                                    item={item}
                                    key={item.id}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenuButton asChild>
                    <NavLink to={returnUrl}>
                        <ArrowLeft />
                        {t('nav.backToApp')}
                    </NavLink>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
}

function SettingsSidebarMenuItem({ item }: SettingsSidebarMenuItemProps) {
    const location = useLocation();
    const { t } = useTranslation();
    const isActive = location.pathname.startsWith(item.path);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActive}
            >
                <NavLink to={item.path}>
                    {item.icon}
                    {t(item.titleKey)}
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
