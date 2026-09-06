const asyncHandler = require('../middleware/asyncHandler');
const SiteSettings = require('../models/SiteSettings');

// Sensible starting content so the site never looks empty before an admin
// has edited anything — mirrors the original hardcoded copy.
const DEFAULTS = {
  aboutContent:
    "KigaliHomes is a marketplace built for Rwanda's capital, helping people find houses, apartments, " +
    'and plots for rent or sale, and helping owners and agents publish listings directly to home seekers.\n\n' +
    'We believe finding a home should be simple, transparent, and trustworthy — every listing goes through ' +
    'an approval process before it appears publicly, and our team reviews reports from the community to keep ' +
    'the marketplace clean.',
  privacyContent:
    'We collect the information you provide when creating an account or listing a property, including your ' +
    'name, contact details, and any content you submit. This information is used to operate the marketplace, ' +
    'connect home seekers with owners/agents, and keep the platform safe.\n\n' +
    'We never display your password to anyone, including our own admin team.',
  termsContent:
    'By using KigaliHomes, you agree to provide accurate information in your listings and account profile, ' +
    'and not to post fraudulent, misleading, or duplicate listings. Violations may result in account suspension.',
  faqItems: [
    { question: 'Is it free to list a property?', answer: 'Yes, creating an account and listing a property is free. Featured placement may be a paid option in the future.' },
    { question: 'How long does approval take?', answer: 'Our team typically reviews new listings within 24–48 hours.' },
    { question: 'How do I contact a property owner?', answer: 'Open any property and use the Call, WhatsApp, or Send Message buttons on the listing page.' },
    { question: 'How do I report a suspicious listing?', answer: 'Use the "Report this listing" link on any property details page.' },
  ],
  contactEmail: 'support@kigalihomes.rw',
  contactPhone: '+250 780 000 000',
  contactAddress: 'Kigali, Rwanda',
  socialFacebook: '',
  socialX: '',
  socialInstagram: '',
};

// There is exactly one settings document. Create it with defaults on first read/write.
async function getOrCreateSettings() {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create(DEFAULTS);
  }
  return settings;
}

// @desc  Get site settings (public) — About/Privacy/Terms/FAQ copy, contact info, social handles
// @route GET /api/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, settings });
});

// @desc  Update site settings (admin only)
// @route PUT /api/admin/settings
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  const {
    aboutContent, privacyContent, termsContent, faqItems,
    contactEmail, contactPhone, contactAddress,
    socialFacebook, socialX, socialInstagram,
  } = req.body;

  if (aboutContent !== undefined) settings.aboutContent = aboutContent;
  if (privacyContent !== undefined) settings.privacyContent = privacyContent;
  if (termsContent !== undefined) settings.termsContent = termsContent;
  if (Array.isArray(faqItems)) {
    settings.faqItems = faqItems
      .filter((f) => f && f.question && f.answer)
      .map((f) => ({ question: f.question, answer: f.answer }));
  }
  if (contactEmail !== undefined) settings.contactEmail = contactEmail;
  if (contactPhone !== undefined) settings.contactPhone = contactPhone;
  if (contactAddress !== undefined) settings.contactAddress = contactAddress;

  // Strip "@" and full URLs down to a bare handle, so the frontend can build a
  // consistent profile link no matter what format the admin pastes in.
  const toHandle = (v) => (v || '').replace(/^https?:\/\/(www\.)?(facebook|x|twitter|instagram)\.com\//i, '').replace(/^@/, '').replace(/\/$/, '');
  if (socialFacebook !== undefined) settings.socialFacebook = toHandle(socialFacebook);
  if (socialX !== undefined) settings.socialX = toHandle(socialX);
  if (socialInstagram !== undefined) settings.socialInstagram = toHandle(socialInstagram);

  await settings.save();
  res.json({ success: true, settings });
});

module.exports = { getSettings, updateSettings };
