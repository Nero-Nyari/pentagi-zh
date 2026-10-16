import { TriangleAlert } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import { useRouteError } from 'react-router-dom';

import type { TranslationKey } from '@/lib/i18n/types';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { useTranslation } from '@/hooks/use-translation';
import { isChunkLoadError, isDomDesyncError, reloadOnce } from '@/lib/chunk-reload';

const subscribeToConnection = (onChange: () => void) => {
    window.addEventListener('online', onChange);
    window.addEventListener('offline', onChange);

    return () => {
        window.removeEventListener('online', onChange);
        window.removeEventListener('offline', onChange);
    };
};

const isBrowserOnline = () => navigator.onLine;

const describeFailure = ({
    isChunk,
    isDesync,
    isOnline,
}: {
    isChunk: boolean;
    isDesync: boolean;
    isOnline: boolean;
}): TranslationKey => {
    if (isChunk && !isOnline) {
        return 'shared.routeError.offlineChunk';
    }

    if (isChunk) {
        return 'shared.routeError.chunk';
    }

    if (isDesync) {
        return 'shared.routeError.desync';
    }

    return 'shared.routeError.generic';
};

/**
 * Root `errorElement` for the data router — replaces React Router's built-in
 * dev crash screen. Two production failures land here: a code-split chunk that
 * 404s after a redeploy (auto-reload once, unless `vite:preloadError` in
 * `main.tsx` already did), and any other render/commit crash (e.g. a `removeChild`
 * desync from browser auto-translation) — both shown as a recoverable card.
 */
function RouteErrorBoundary() {
    const { t } = useTranslation();
    const error = useRouteError();
    const isChunk = isChunkLoadError(error);
    const isDesync = isDomDesyncError(error);
    const isOnline = useSyncExternalStore(subscribeToConnection, isBrowserOnline);
    const isWaitingForConnection = isChunk && !isOnline;

    useEffect(() => {
        if (isChunk || isDesync) {
            reloadOnce();
        }
    }, [isChunk, isDesync, isOnline]);

    return (
        <div
            className="grid min-h-svh w-full place-items-center p-4"
            role="alert"
        >
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <TriangleAlert />
                    </EmptyMedia>
                    <EmptyTitle>{t('shared.routeError.title')}</EmptyTitle>
                    <EmptyDescription>{t(describeFailure({ isChunk, isDesync, isOnline }))}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button
                        disabled={isWaitingForConnection}
                        onClick={() => window.location.reload()}
                        variant="secondary"
                    >
                        {t('shared.routeError.reload')}
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}

export default RouteErrorBoundary;
