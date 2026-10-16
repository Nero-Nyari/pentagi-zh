import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlowDashboardOverview } from '@/features/flows/dashboard/flow-dashboard-overview';
import { useTranslation } from '@/hooks/use-translation';
import { useFlow } from '@/providers/flow-provider';

function FlowDashboard() {
    const { t } = useTranslation();
    const { flowId } = useFlow();

    if (!flowId) {
        return (
            <div className="text-muted-foreground flex items-center justify-center py-12">
                {t('flows.dashboard.selectFlow')}
            </div>
        );
    }

    return (
        <Tabs defaultValue="overview">
            <TabsList className="hidden">
                <TabsTrigger value="overview">{t('flows.dashboard.tab.overview')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <FlowDashboardOverview flowId={flowId} />
            </TabsContent>
        </Tabs>
    );
}

export default FlowDashboard;
