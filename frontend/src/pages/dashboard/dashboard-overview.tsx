import { useQuery } from '@apollo/client/react';
import { Activity, CircleDollarSign, Cpu, GitFork } from 'lucide-react';

import type { UsageStatsFragmentFragment } from '@/graphql/types';

import { DashboardError, LoadingTable, MetricCard, UsageStatsRow } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    FlowsStatsTotalDocument,
    ToolcallsStatsByFunctionDocument,
    ToolcallsStatsTotalDocument,
    UsageStatsByAgentTypeDocument,
    UsageStatsByModelDocument,
    UsageStatsByProviderDocument,
    UsageStatsTotalDocument,
} from '@/graphql/types';
import { useTranslation } from '@/hooks/use-translation';
import { formatCost, formatDuration, formatNumber, formatTokenCount } from '@/lib/utils/format';

export function DashboardOverview() {
    const { t } = useTranslation();
    const {
        data: usageTotalData,
        error: usageTotalError,
        loading: usageTotalLoading,
    } = useQuery(UsageStatsTotalDocument);
    const {
        data: usageByProviderData,
        error: usageByProviderError,
        loading: usageByProviderLoading,
    } = useQuery(UsageStatsByProviderDocument);
    const {
        data: usageByModelData,
        error: usageByModelError,
        loading: usageByModelLoading,
    } = useQuery(UsageStatsByModelDocument);
    const {
        data: usageByAgentTypeData,
        error: usageByAgentTypeError,
        loading: usageByAgentTypeLoading,
    } = useQuery(UsageStatsByAgentTypeDocument);
    const {
        data: toolcallsTotalData,
        error: toolcallsTotalError,
        loading: toolcallsTotalLoading,
    } = useQuery(ToolcallsStatsTotalDocument);
    const {
        data: toolcallsByFunctionData,
        error: toolcallsByFunctionError,
        loading: toolcallsByFunctionLoading,
    } = useQuery(ToolcallsStatsByFunctionDocument);
    const {
        data: flowsTotalData,
        error: flowsTotalError,
        loading: flowsTotalLoading,
    } = useQuery(FlowsStatsTotalDocument);

    const usageTotal = usageTotalData?.usageStatsTotal;
    const toolcallsTotal = toolcallsTotalData?.toolcallsStatsTotal;
    const flowsTotal = flowsTotalData?.flowsStatsTotal;

    const totalCost = usageTotal ? usageTotal.totalUsageCostIn + usageTotal.totalUsageCostOut : 0;
    const totalTokens = usageTotal ? usageTotal.totalUsageIn + usageTotal.totalUsageOut : 0;

    const providerRows = (usageByProviderData?.usageStatsByProvider ?? []).map((item) => ({
        label: item.provider,
        stats: item.stats,
    }));
    const modelRows = (usageByModelData?.usageStatsByModel ?? []).map((item) => ({
        label: `${item.model} (${item.provider})`,
        stats: item.stats,
    }));
    const agentTypeRows = (usageByAgentTypeData?.usageStatsByAgentType ?? []).map((item) => ({
        label: item.agentType,
        stats: item.stats,
    }));

    const toolcallsByFunction = [...(toolcallsByFunctionData?.toolcallsStatsByFunction ?? [])].sort(
        (a, b) => b.totalCount - a.totalCount,
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    description={t('dashboard.overview.metrics.flows.description', {
                        assistants: flowsTotal?.totalAssistantsCount ?? 0,
                        subtasks: flowsTotal?.totalSubtasksCount ?? 0,
                        tasks: flowsTotal?.totalTasksCount ?? 0,
                    })}
                    error={!!flowsTotalError && !flowsTotalData}
                    icon={<GitFork className="text-muted-foreground size-4" />}
                    loading={flowsTotalLoading && !flowsTotalData}
                    title={t('dashboard.overview.metrics.flows.title')}
                    value={flowsTotal ? formatNumber(flowsTotal.totalFlowsCount) : '0'}
                />
                <MetricCard
                    description={t('dashboard.overview.metrics.toolCalls.description', {
                        duration: toolcallsTotal ? formatDuration(toolcallsTotal.totalDurationSeconds) : '—',
                    })}
                    error={!!toolcallsTotalError && !toolcallsTotalData}
                    icon={<Activity className="text-muted-foreground size-4" />}
                    loading={toolcallsTotalLoading && !toolcallsTotalData}
                    title={t('dashboard.overview.metrics.toolCalls.title')}
                    value={toolcallsTotal ? formatNumber(toolcallsTotal.totalCount) : '0'}
                />
                <MetricCard
                    description={t('dashboard.overview.metrics.tokens.description')}
                    error={!!usageTotalError && !usageTotalData}
                    icon={<Cpu className="text-muted-foreground size-4" />}
                    loading={usageTotalLoading && !usageTotalData}
                    title={t('dashboard.overview.metrics.tokens.title')}
                    value={formatTokenCount(totalTokens)}
                />
                <MetricCard
                    description={t('dashboard.overview.metrics.cost.description')}
                    error={!!usageTotalError && !usageTotalData}
                    icon={<CircleDollarSign className="text-muted-foreground size-4" />}
                    loading={usageTotalLoading && !usageTotalData}
                    title={t('dashboard.overview.metrics.cost.title')}
                    value={formatCost(totalCost)}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.overview.usageByProvider.title')}</CardTitle>
                    <CardDescription>{t('dashboard.overview.usageByProvider.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {usageByProviderLoading && !usageByProviderData ? (
                        <LoadingTable />
                    ) : usageByProviderError && !usageByProviderData ? (
                        <ErrorTable />
                    ) : (
                        <UsageStatsTable
                            label={t('dashboard.overview.usageByProvider.title')}
                            rows={providerRows}
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.overview.usageByModel.title')}</CardTitle>
                    <CardDescription>{t('dashboard.overview.usageByModel.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {usageByModelLoading && !usageByModelData ? (
                        <LoadingTable />
                    ) : usageByModelError && !usageByModelData ? (
                        <ErrorTable />
                    ) : (
                        <UsageStatsTable
                            label={t('dashboard.overview.usageByModel.title')}
                            rows={modelRows}
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.overview.usageByAgentType.title')}</CardTitle>
                    <CardDescription>{t('dashboard.overview.usageByAgentType.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {usageByAgentTypeLoading && !usageByAgentTypeData ? (
                        <LoadingTable />
                    ) : usageByAgentTypeError && !usageByAgentTypeData ? (
                        <ErrorTable />
                    ) : (
                        <UsageStatsTable
                            label={t('dashboard.overview.usageByAgentType.title')}
                            rows={agentTypeRows}
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.overview.toolCallsByFunction.title')}</CardTitle>
                    <CardDescription>{t('dashboard.overview.toolCallsByFunction.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {toolcallsByFunctionLoading && !toolcallsByFunctionData ? (
                        <LoadingTable />
                    ) : toolcallsByFunctionError && !toolcallsByFunctionData ? (
                        <ErrorTable />
                    ) : (
                        <Table aria-label={t('dashboard.overview.toolCallsByFunction.title')}>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">
                                        {t('dashboard.overview.table.function')}
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap">
                                        {t('dashboard.overview.table.type')}
                                    </TableHead>
                                    <TableHead className="text-right whitespace-nowrap">
                                        {t('dashboard.overview.table.count')}
                                    </TableHead>
                                    <TableHead className="text-right whitespace-nowrap">
                                        {t('dashboard.overview.table.totalDuration')}
                                    </TableHead>
                                    <TableHead className="text-right whitespace-nowrap">
                                        {t('dashboard.overview.table.avgDuration')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {toolcallsByFunction.map((item) => (
                                    <TableRow key={item.functionName}>
                                        <TableCell className="font-medium">{item.functionName}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.isAgent ? 'secondary' : 'outline'}>
                                                {item.isAgent
                                                    ? t('dashboard.overview.badge.agent')
                                                    : t('dashboard.overview.badge.tool')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{formatNumber(item.totalCount)}</TableCell>
                                        <TableCell className="text-right">
                                            {formatDuration(item.totalDurationSeconds)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatDuration(item.avgDurationSeconds)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ErrorTable() {
    return <DashboardError className="py-8" />;
}

function UsageStatsTable({
    label,
    rows,
}: {
    label: string;
    rows: Array<{ label: string; stats: UsageStatsFragmentFragment }>;
}) {
    const { t } = useTranslation();

    return (
        <Table aria-label={label}>
            <TableHeader>
                <TableRow>
                    <TableHead className="whitespace-nowrap">{t('dashboard.usage.table.name')}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                        {t('dashboard.usage.table.tokensIn')}
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                        {t('dashboard.usage.table.tokensOut')}
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t('dashboard.usage.table.cacheIn')}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                        {t('dashboard.usage.table.cacheOut')}
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t('dashboard.usage.table.costIn')}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t('dashboard.usage.table.costOut')}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                        {t('dashboard.usage.table.totalCost')}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <UsageStatsRow
                        key={row.label}
                        label={row.label}
                        stats={row.stats}
                    />
                ))}
            </TableBody>
        </Table>
    );
}
