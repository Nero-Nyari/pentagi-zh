import { useTranslation } from '@/hooks/use-translation';

function PageLoader() {
    const { t } = useTranslation();

    return (
        <div className="grid h-screen w-full place-items-center">
            <p>{t('shared.pageLoader.loading')}</p>
        </div>
    );
}

export default PageLoader;
