import StaticPage from './StaticPage';
import { useSiteSettings } from '../context/SiteSettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Terms() {
  const { settings, loading } = useSiteSettings();

  return (
    <StaticPage title="Terms of Service">
      {loading || !settings ? (
        <LoadingSpinner />
      ) : (
        settings.termsContent.split('\n\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
      )}
    </StaticPage>
  );
}
