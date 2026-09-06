import StaticPage from './StaticPage';
import { useSiteSettings } from '../context/SiteSettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Privacy() {
  const { settings, loading } = useSiteSettings();

  return (
    <StaticPage title="Privacy Policy">
      {loading || !settings ? (
        <LoadingSpinner />
      ) : (
        settings.privacyContent.split('\n\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
      )}
    </StaticPage>
  );
}
