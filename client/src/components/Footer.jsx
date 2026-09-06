import { Link } from 'react-router-dom';
import { Home as HomeIcon, Facebook, Instagram, Twitter } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Footer() {
  const { settings } = useSiteSettings();

  const socials = [
    { key: 'socialFacebook', label: 'Facebook', icon: Facebook, base: 'https://facebook.com/' },
    { key: 'socialX', label: 'X (Twitter)', icon: Twitter, base: 'https://x.com/' },
    { key: 'socialInstagram', label: 'Instagram', icon: Instagram, base: 'https://instagram.com/' },
  ].filter((s) => settings?.[s.key]);

  return (
    <footer className="border-t border-gray-100 bg-forest-50/60 text-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-600 text-white">
                <HomeIcon size={18} />
              </span>
              <span className="font-display text-lg font-semibold text-forest-800">KigaliHomes</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Find a place you'll love to call home — houses, apartments and plots across Kigali.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-charcoal">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-forest-700">About</Link></li>
              <li><Link to="/contact" className="hover:text-forest-700">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-forest-700">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-charcoal">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/privacy" className="hover:text-forest-700">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-forest-700">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-charcoal">Follow us</h4>
            {socials.length === 0 ? (
              <p className="text-sm text-gray-400">Coming soon.</p>
            ) : (
              <div className="flex gap-3">
                {socials.map(({ key, label, icon: Icon, base }) => (
                  <a
                    key={key}
                    href={`${base}${settings[key]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white text-forest-700 shadow-sm hover:bg-forest-100"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-forest-100 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} KigaliHomes. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
