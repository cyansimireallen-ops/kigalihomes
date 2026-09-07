const mongoose = require('mongoose');

const faqItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// This is a SINGLETON — there is only ever one SiteSettings document. It holds
// everything an admin can edit about the site's static/public-facing content:
// About/Privacy/Terms copy, FAQ entries, the Contact page details, and the
// social media handles used to build the footer's Facebook/X/Instagram links.
const siteSettingsSchema = new mongoose.Schema(
  {
    aboutContent: { type: String, default: '' },
    privacyContent: { type: String, default: '' },
    termsContent: { type: String, default: '' },
    faqItems: { type: [faqItemSchema], default: [] },

    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactAddress: { type: String, default: '' },

    // Stored as plain handles/usernames (no "@", no full URL) — the frontend
    // builds the actual profile URL from these. Left blank = icon hidden.
    socialFacebook: { type: String, default: '' },
    socialX: { type: String, default: '' },
    socialInstagram: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
