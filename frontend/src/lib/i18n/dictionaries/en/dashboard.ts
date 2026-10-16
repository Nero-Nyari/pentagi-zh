export const dashboard = {
    'dashboard.analytics.assistants': '{count} assistants',
    'dashboard.analytics.assistants_one': '{count} assistant',
    'dashboard.analytics.cost.description':
        'LLM spending per day. May stay near zero when using local engines — this is expected.',

    'dashboard.analytics.cost.title': 'Cost Over Time',
    'dashboard.analytics.execution.description': 'Execution time and tool calls breakdown per flow',
    'dashboard.analytics.execution.empty': 'No flow executions in this period',

    // 分析页流程执行明细。
    'dashboard.analytics.execution.title': 'Flow Execution Details',
    'dashboard.analytics.flowFallback': 'Flow #{id}',
    'dashboard.analytics.flowsActivity.description': 'Flows, tasks, and subtasks created per day',
    // 分析页图表卡片。
    'dashboard.analytics.flowsActivity.title': 'Flows Activity Over Time',
    'dashboard.analytics.series.costIn': 'Cost In',
    'dashboard.analytics.series.costOut': 'Cost Out',
    // 图表系列的图例 / 提示标签。
    'dashboard.analytics.series.flows': 'Flows',
    'dashboard.analytics.series.subtasks': 'Subtasks',

    'dashboard.analytics.series.tasks': 'Tasks',
    'dashboard.analytics.series.tokensIn': 'Tokens In',
    'dashboard.analytics.series.tokensOut': 'Tokens Out',
    'dashboard.analytics.series.toolCalls': 'Tool Calls',
    'dashboard.analytics.subtaskFallback': 'Subtask #{id}',
    'dashboard.analytics.subtasks': '{count} subtasks',
    'dashboard.analytics.subtasks_one': '{count} subtask',
    'dashboard.analytics.taskFallback': 'Task #{id}',

    'dashboard.analytics.tasks': '{count} tasks',
    'dashboard.analytics.tasks_one': '{count} task',
    'dashboard.analytics.tokenUsage.description': 'Input and output tokens processed daily',
    'dashboard.analytics.tokenUsage.title': 'Token Usage Over Time',
    'dashboard.analytics.toolCalls.description': 'Number of tool executions per day',
    'dashboard.analytics.toolCalls.title': 'Tool Calls Over Time',
    // 图表空态与错误态的通用占位文案。
    'dashboard.chart.empty': 'No data for this period',

    'dashboard.error.load': "Couldn't load",
    'dashboard.overview.badge.agent': 'Agent',
    'dashboard.overview.badge.tool': 'Tool',
    'dashboard.overview.metrics.cost.description': 'Total LLM spending across all providers',
    'dashboard.overview.metrics.cost.title': 'Total Cost',
    'dashboard.overview.metrics.flows.description': 'Tasks: {tasks} · Subtasks: {subtasks} · Assistants: {assistants}',
    // 概览页顶部指标卡。
    'dashboard.overview.metrics.flows.title': 'Total Flows',
    'dashboard.overview.metrics.tokens.description': 'Input + Output tokens processed',

    'dashboard.overview.metrics.tokens.title': 'Total Tokens',
    'dashboard.overview.metrics.toolCalls.description': 'Total duration: {duration}',
    'dashboard.overview.metrics.toolCalls.title': 'Tool Calls',
    'dashboard.overview.table.avgDuration': 'Avg Duration',
    'dashboard.overview.table.count': 'Count',
    // 概览页「按函数统计的工具调用」表格。
    'dashboard.overview.table.function': 'Function',
    'dashboard.overview.table.totalDuration': 'Total Duration',
    'dashboard.overview.table.type': 'Type',

    'dashboard.overview.toolCallsByFunction.description': 'Execution statistics for each tool function',
    'dashboard.overview.toolCallsByFunction.title': 'Tool Calls by Function',
    'dashboard.overview.usageByAgentType.description': 'LLM token usage and costs grouped by agent type',
    'dashboard.overview.usageByAgentType.title': 'Usage by Agent Type',
    'dashboard.overview.usageByModel.description': 'LLM token usage and costs grouped by model',
    'dashboard.overview.usageByModel.title': 'Usage by Model',
    'dashboard.overview.usageByProvider.description': 'LLM token usage and costs grouped by provider',
    // 概览页用量卡片。
    'dashboard.overview.usageByProvider.title': 'Usage by Provider',

    'dashboard.period.month': 'Month',
    'dashboard.period.quarter': 'Quarter',
    // 分析页的时间区间选择器。
    'dashboard.period.week': 'Week',
    'dashboard.tabs.analytics': 'Analytics',
    'dashboard.tabs.overview': 'Overview',
    // 页面外壳与标签页。
    'dashboard.title': 'Dashboard',
    'dashboard.usage.table.cacheIn': 'Cache In',
    'dashboard.usage.table.cacheOut': 'Cache Out',
    'dashboard.usage.table.costIn': 'Cost In',
    'dashboard.usage.table.costOut': 'Cost Out',
    // 用量明细表格列头（供应商 / 模型 / 代理类型共用）。
    'dashboard.usage.table.name': 'Name',
    'dashboard.usage.table.tokensIn': 'Tokens In',

    'dashboard.usage.table.tokensOut': 'Tokens Out',
    'dashboard.usage.table.totalCost': 'Total Cost',
};
