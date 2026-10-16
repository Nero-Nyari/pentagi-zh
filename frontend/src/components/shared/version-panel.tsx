import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { formatDistance } from 'date-fns';
import { ChevronsUpDown, CircleArrowDown, CircleCheck, CircleQuestionMark, ExternalLink } from 'lucide-react';

import type { VersionInfoFragmentFragment } from '@/graphql/types';
import type { Translator } from '@/lib/i18n/types';

import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UpdateState } from '@/graphql/types';
import { useTranslation } from '@/hooks/use-translation';
import { dictionaries } from '@/lib/i18n/dictionaries';
import { createTranslator } from '@/lib/i18n/translator';
import { cn } from '@/lib/utils';
import { useVersionInfo } from '@/providers/version-info-provider';

export const PENTAGI_RELEASES_URL = 'https://github.com/vxcontrol/pentagi/releases';

export const UPDATE_INSTRUCTION =
    'Run the installer tool on the host where PentAGI is deployed and choose Maintenance → Update PentAGI.';

// 供单测等直接调用场景回退：这些纯函数默认英文文案，组件再把当前语言的 t 传进来。
const englishTranslator: Translator = createTranslator(dictionaries.en);

export interface VersionFact {
    isAccented?: boolean;
    isMono?: boolean;
    label: string;
    value: string;
}

export type VersionIndicator = 'none' | 'question' | 'update';

export interface VersionPresentation {
    action: null | string;
    detail: string;
    headline: string;
    indicator: VersionIndicator;
    label: string;
    latest: null | string;
    tooltip: string;
}

// The revision follows the edition after a dot and carries an "h" that keeps it
// an alphanumeric semver identifier (2.1.0-ce.h93e99748). The prefix is optional
// and the hyphen is kept, so a build stamped before either still splits, and the
// captured group is the bare hash the panel shows.
const REVISION_SUFFIX = /^(.+)[-.]h?([0-9a-f]{7,40})$/i;

// The edition is a prerelease marker on the build, not part of the release it
// names, so it is stripped before anything looks the release up.
const EDITION_SUFFIX = /-(?:ce|ee)$/i;

interface VersionPanelProps {
    icon: ReactNode;
    title: string;
}

export function describeTiming(
    info: VersionInfoFragmentFragment,
    now: Date = new Date(),
    t: Translator = englishTranslator,
): VersionFact[] {
    const facts: VersionFact[] = [];

    if (info.checkedAt) {
        facts.push({
            label: t('shared.version.checked'),
            value: formatDistance(new Date(info.checkedAt), now, { addSuffix: true }),
        });
    }

    if (info.failedAt) {
        facts.push({
            label: t('shared.version.lastCheckFailed'),
            value: formatDistance(new Date(info.failedAt), now, { addSuffix: true }),
        });
    }

    return facts;
}

export function describeVersion(
    info: VersionInfoFragmentFragment,
    t: Translator = englishTranslator,
): VersionPresentation {
    const { version } = splitVersion(info.current);
    const label = formatVersionLabel(version);
    const latest = info.latest && isVersionNumber(info.latest) ? formatVersionLabel(info.latest) : null;
    const base = { action: null, label, latest };

    switch (info.state) {
        case UpdateState.Disabled:
            return {
                ...base,
                detail: t('shared.version.disabledDetail'),
                headline: t('shared.version.disabledHeadline'),
                indicator: 'question',
                tooltip: t('shared.version.disabledTooltip'),
            };
        case UpdateState.Pending:
            return {
                ...base,
                detail: t('shared.version.pendingDetail'),
                headline: t('shared.version.pendingHeadline'),
                indicator: 'question',
                tooltip: t('shared.version.pendingTooltip'),
            };
        case UpdateState.Unreachable:
            return {
                ...base,
                detail: t('shared.version.unreachableDetail'),
                headline: t('shared.version.unreachableHeadline'),
                indicator: 'question',
                tooltip: t('shared.version.unreachableTooltip'),
            };
        case UpdateState.UpdateAvailable:
            if (latest) {
                return {
                    ...base,
                    action: t('shared.version.installInstruction'),
                    detail: t('shared.version.updateDetail'),
                    headline: t('shared.version.updateHeadline', { version: latest }),
                    indicator: 'update',
                    tooltip: t('shared.version.updateTooltip', { version: latest }),
                };
            }

            return describeUnknown(base, t);
        case UpdateState.UpToDate:
            return {
                ...base,
                detail: t('shared.version.upToDateDetail', { label, strategy: info.strategy }),
                headline: t('shared.version.upToDateHeadline'),
                indicator: 'none',
                tooltip: t('shared.version.upToDateTooltip', { label }),
            };
        case UpdateState.Unknown:
        default:
            return describeUnknown(base, t);
    }
}

export function formatVersionLabel(version: string): string {
    return /^\d/.test(version) ? `v${version}` : version;
}

export function releaseNotesUrl(version: string): null | string {
    if (!isVersionNumber(version)) {
        return null;
    }

    // The tag is the release, not the build: v2.1.0-ce is not a tag that exists.
    const release = version.replace(EDITION_SUFFIX, '');
    const tag = release.startsWith('v') ? release : `v${release}`;

    return `${PENTAGI_RELEASES_URL}/tag/${encodeURIComponent(tag)}`;
}

export function splitVersion(current: string): { revision: null | string; version: string } {
    const match = REVISION_SUFFIX.exec(current);
    const version = match?.[1];
    const revision = match?.[2];

    if (version && revision) {
        return { revision, version };
    }

    return { revision: null, version: current };
}

function describeUnknown(base: Pick<VersionPresentation, 'action' | 'label' | 'latest'>, t: Translator) {
    const newest = base.latest ? ` ${t('shared.version.unknownNewest', { version: base.latest })}` : '';

    return {
        ...base,
        detail: `${t('shared.version.unknownDetail')}${newest}`,
        headline: t('shared.version.unknownHeadline'),
        indicator: 'question' as const,
        tooltip: t('shared.version.unknownTooltip'),
    };
}

function isVersionNumber(value: string): boolean {
    return /^v?\d/.test(value);
}

const markWrapper =
    'flex aspect-square size-8 shrink-0 items-center justify-center group-data-[collapsible=icon]:[&>svg]:size-6';

const indicatorIcons: Record<VersionIndicator, { className: string; icon: LucideIcon; tint: string }> = {
    none: { className: 'text-green-500', icon: CircleCheck, tint: 'bg-green-500/15' },
    question: { className: 'text-muted-foreground', icon: CircleQuestionMark, tint: 'bg-muted' },
    update: { className: 'text-yellow-500', icon: CircleArrowDown, tint: 'bg-yellow-500/15' },
};

export function VersionPanel({ icon, title }: VersionPanelProps) {
    const { t } = useTranslation();
    const { isLoading, versionInfo } = useVersionInfo();

    if (!versionInfo) {
        return (
            <SidebarMenuButton
                asChild
                className="pointer-events-none"
                size="lg"
            >
                <div>
                    <div className={markWrapper}>{icon}</div>
                    <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-semibold">{title}</span>
                        {isLoading && <Skeleton className="mt-1 h-3 w-20" />}
                    </div>
                </div>
            </SidebarMenuButton>
        );
    }

    const presentation = describeVersion(versionInfo, t);
    const { className: indicatorClass, icon: Indicator, tint } = indicatorIcons[presentation.indicator];
    const hasUpdate = presentation.indicator === 'update';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                    aria-label={`${title} ${presentation.label}. ${presentation.tooltip}`}
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    size="lg"
                    tooltip={presentation.tooltip}
                >
                    <div className={cn('relative', markWrapper)}>
                        {icon}
                        {hasUpdate && (
                            <span
                                aria-hidden
                                className={cn(
                                    'ring-sidebar absolute top-0 right-0 hidden size-2 rounded-full bg-current ring-2 group-data-[collapsible=icon]:block',
                                    indicatorClass,
                                )}
                                data-slot="version-attention-dot"
                            />
                        )}
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-semibold">{title}</span>
                        <span className="truncate text-xs">{presentation.label}</span>
                    </div>
                    {hasUpdate && (
                        <Indicator
                            aria-hidden
                            className={cn('size-5! shrink-0 rounded-full p-0.5', indicatorClass, tint)}
                            data-slot="version-indicator-update"
                        />
                    )}
                    <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-72"
                side="bottom"
            >
                <VersionDetails
                    presentation={presentation}
                    versionInfo={versionInfo}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function ExternalLinkRow({ children, href }: { children: React.ReactNode; href: string }) {
    return (
        <DropdownMenuItem asChild>
            <a
                href={href}
                rel="noreferrer"
                target="_blank"
            >
                <span className="truncate">{children}</span>
                <ExternalLink
                    aria-hidden
                    className="text-muted-foreground ml-auto shrink-0"
                />
            </a>
        </DropdownMenuItem>
    );
}

function VersionDetails({
    presentation,
    versionInfo,
}: {
    presentation: VersionPresentation;
    versionInfo: VersionInfoFragmentFragment;
}) {
    const { t } = useTranslation();
    const { className: statusClass, icon: StatusIcon } = indicatorIcons[presentation.indicator];
    const facts: VersionFact[] = [
        { isMono: true, label: t('shared.version.installed'), value: presentation.label },
        ...(presentation.indicator === 'update' && presentation.latest
            ? [{ isAccented: true, isMono: true, label: t('shared.version.available'), value: presentation.latest }]
            : []),
        ...describeTiming(versionInfo, undefined, t),
    ];
    const releaseNotes =
        presentation.indicator === 'update' && versionInfo.latest ? releaseNotesUrl(versionInfo.latest) : null;

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-start justify-between gap-2 px-1 py-1.5">
                    <div className="min-w-0">
                        <div className="truncate font-semibold">
                            {t('shared.version.title', { version: presentation.label })}
                        </div>
                        <div className="text-muted-foreground truncate font-mono text-xs">
                            {t('shared.version.build', { build: versionInfo.build })}
                        </div>
                    </div>
                    {versionInfo.strategy && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge
                                    aria-label={t('shared.version.channelAria', { strategy: versionInfo.strategy })}
                                    className="shrink-0 cursor-help capitalize"
                                    variant="secondary"
                                >
                                    {versionInfo.strategy}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-64">
                                {t('shared.version.channelTooltip', { strategy: versionInfo.strategy })}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <div className="px-2 py-2">
                <div className="flex items-center gap-2">
                    <StatusIcon
                        aria-hidden
                        className={cn('size-4 shrink-0', statusClass)}
                    />
                    <span className="text-sm leading-snug font-medium">{presentation.headline}</span>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm">{presentation.action ?? presentation.detail}</p>
                <dl className="mt-3 flex flex-col gap-1.5">
                    {facts.map((fact) => (
                        <div
                            className="flex items-baseline justify-between gap-3"
                            key={fact.label}
                        >
                            <dt className="text-muted-foreground shrink-0 text-xs font-medium">{fact.label}</dt>
                            <dd
                                className={cn(
                                    'truncate text-xs',
                                    fact.isMono && 'font-mono tabular-nums',
                                    fact.isAccented ? 'text-foreground font-semibold' : 'text-muted-foreground',
                                )}
                            >
                                {fact.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>

            <DropdownMenuSeparator />

            {releaseNotes && presentation.latest && (
                <ExternalLinkRow href={releaseNotes}>
                    {t('shared.version.releaseNotesFor', { version: presentation.latest })}
                </ExternalLinkRow>
            )}
            <ExternalLinkRow href={PENTAGI_RELEASES_URL}>{t('shared.version.allReleases')}</ExternalLinkRow>
        </>
    );
}
