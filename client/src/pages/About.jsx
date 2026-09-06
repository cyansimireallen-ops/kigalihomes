import StaticPage from './StaticPage';
import { useSiteSettings } from '../context/SiteSettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function About() {
  const { settings, loading } = useSiteSettings();

  return (
    <StaticPage title="About KigaliHomes">
      {loading || !settings ? (
        <LoadingSpinner />
      ) : (
        settings.aboutContent.split('\n\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
      )}
    </StaticPage>
  );
}
