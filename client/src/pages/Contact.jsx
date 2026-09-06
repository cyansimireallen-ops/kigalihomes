import { Mail, Phone, MapPin } from 'lucide-react';
import StaticPage from './StaticPage';
import { useSiteSettings } from '../context/SiteSettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Contact() {
  const { settings, loading } = useSiteSettings();

  return (
    <StaticPage title="Contact Us">
      <p>Have a question or need help with your account or a listing? Reach out to our team.</p>
      {loading || !settings ? (
        <LoadingSpinner />
      ) : (
        <ul className="space-y-2">
          {settings.contactEmail && (
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-forest-600" />
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-forest-700">{settings.contactEmail}</a>
            </li>
          )}
          {settings.contactPhone && (
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-forest-600" />
              <a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} className="hover:text-forest-700">{settings.contactPhone}</a>
            </li>
          )}
          {settings.contactAddress && (
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-forest-600" /> {settings.contactAddress}
            </li>
          )}
        </ul>
      )}
    </StaticPage>
  );
}
