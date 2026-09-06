import StaticPage from './StaticPage';
import { useSiteSettings } from '../context/SiteSettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function FAQ() {
  const { settings, loading } = useSiteSettings();

  return (
    <StaticPage title="Frequently Asked Questions">
      {loading || !settings ? (
        <LoadingSpinner />
      ) : settings.faqItems.length === 0 ? (
        <p>No questions have been added yet.</p>
      ) : (
        <div className="space-y-5">
          {settings.faqItems.map((f, i) => (
            <div key={i}>
              <h3 className="font-medium text-charcoal">{f.question}</h3>
              <p className="mt-1">{f.answer}</p>
            </div>
          ))}
        </div>
      )}
    </StaticPage>
  );
}
