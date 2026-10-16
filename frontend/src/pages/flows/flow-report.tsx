import { skipToken, useQuery } from '@apollo/client/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import Logo from '@/components/icons/logo';
import Markdown from '@/components/shared/markdown';
import { FlowReportDocument } from '@/graphql/types';
import { useTranslation } from '@/hooks/use-translation';
import { Log } from '@/lib/log';
import { generateFileName, generatePDFFromMarkdown, generateReport } from '@/lib/report';

type PdfPhase = 'done' | 'error' | 'idle';
type ReportState = 'content' | 'error' | 'generating' | 'loading';

function FlowReport() {
    const { t } = useTranslation();
    const { flowId } = useParams<{ flowId: string }>();
    const [searchParams] = useSearchParams();
    const download = searchParams.has('download');
    const silent = searchParams.has('silent');

    const [pdfPhase, setPdfPhase] = useState<PdfPhase>('idle');
    const [pdfError, setPdfError] = useState<null | string>(null);
    const pdfTriggered = useRef(false);

    const [prevFlowId, setPrevFlowId] = useState(flowId);

    if (flowId !== prevFlowId) {
        setPrevFlowId(flowId);
        setPdfPhase('idle');
        setPdfError(null);
    }

    const { data, loading } = useQuery(
        FlowReportDocument,
        flowId ? { errorPolicy: 'all', variables: { id: flowId } } : skipToken,
    );

    // Under `errorPolicy:'all'` a partial error arrives alongside a flow that loaded fine.
    const dataReady = !loading && !!data?.flow;

    const reportContent = useMemo(
        () => (dataReady ? generateReport(data.tasks || [], data.flow!, t) : ''),
        [dataReady, data, t],
    );

    useEffect(() => {
        pdfTriggered.current = false;
    }, [flowId]);

    useEffect(() => {
        if (!dataReady || !download || pdfTriggered.current || !data?.flow) {
            return;
        }

        pdfTriggered.current = true;

        // The generator appends the extension itself.
        const fileName = generateFileName(data.flow);

        generatePDFFromMarkdown(reportContent, fileName)
            .then(() => {
                if (silent) {
                    setTimeout(() => window.close(), 1000);
                } else {
                    setPdfPhase('done');
                }
            })
            .catch((err) => {
                Log.error('PDF generation failed:', err);
                setPdfError(t('report.error.pdfFailed'));
                setPdfPhase('error');
            });
    }, [dataReady, download, silent, reportContent, data, t]);

    let state: ReportState;
    let errorMessage: null | string = null;

    if (loading) {
        state = 'loading';
    } else if (!data?.flow) {
        state = 'error';
        errorMessage = t('report.error.loadFailed');
    } else if (pdfPhase === 'error') {
        state = 'error';
        errorMessage = pdfError;
    } else if (download && pdfPhase !== 'done') {
        state = 'generating';
    } else {
        state = 'content';
    }

    if (state === 'loading' || state === 'generating') {
        const isLoadingPhase = state === 'loading';
        const title = isLoadingPhase ? t('report.loading.title') : t('report.generating.title');
        const description = isLoadingPhase ? t('report.loading.description') : t('report.generating.description');

        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex min-h-screen flex-col items-center justify-center p-8">
                    <Logo className="animate-logo-spin mb-8 size-16 text-white" />
                    <div className="flex flex-col gap-4 text-center">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
                        <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-blue-600" />
                        <p className="max-w-md text-gray-600 dark:text-gray-400">{description}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex min-h-screen flex-col items-center justify-center p-8">
                    <Logo className="mb-8 size-16" />
                    <div className="flex flex-col gap-4 text-center">
                        <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
                            {t('report.error.title')}
                        </h1>
                        <p className="max-w-md text-gray-600 dark:text-gray-400">
                            {errorMessage || t('report.error.default')}
                        </p>
                        <button
                            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                            onClick={() => window.close()}
                        >
                            {t('report.error.close')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="h-screen w-full overflow-auto p-8">
                <div className="mx-auto max-w-4xl">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <Markdown>{reportContent}</Markdown>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FlowReport;
