import { useEffect, useState } from 'react';
import { Plus, Trash2, Facebook, Instagram, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

function Section({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg text-charcoal">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 5 }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-charcoal">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus-ring focus:border-forest-500"
      />
      <span className="mt-1 block text-xs text-gray-400">Leave a blank line between paragraphs.</span>
    </label>
  );
}

export default function AdminContent() {
  const { refresh } = useSiteSettings();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => setForm(res.data.settings)).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateFaq = (index, key, value) => {
    setForm((f) => {
      const faqItems = [...f.faqItems];
      faqItems[index] = { ...faqItems[index], [key]: value };
      return { ...f, faqItems };
    });
  };

  const addFaq = () => setForm((f) => ({ ...f, faqItems: [...f.faqItems, { question: '', answer: '' }] }));
  const removeFaq = (index) => setForm((f) => ({ ...f, faqItems: f.faqItems.filter((_, i) => i !== index) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', form);
      setForm(res.data.settings);
      await refresh(); // so the live site (About/Contact/FAQ/footer) picks up the change immediately
      toast.success('Site content updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Site Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Edit what visitors see on About, Contact, FAQ, Privacy Policy and Terms of Service — and connect your social accounts.
          </p>
        </div>
        <Button type="submit" loading={saving}>Save All Changes</Button>
      </div>

      <Section title="About Page">
        <TextArea label="About content" value={form.aboutContent} onChange={(e) => update('aboutContent', e.target.value)} rows={6} />
      </Section>

      <Section title="Contact Page" description="Shown on the Contact page.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Support Email" type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
          <Input label="Support Phone" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
        </div>
        <Input label="Address" value={form.contactAddress} onChange={(e) => update('contactAddress', e.target.value)} />
      </Section>

      <Section title="FAQ" description="Questions and answers shown on the FAQ page.">
        {form.faqItems.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-3">
                <Input label={`Question ${i + 1}`} value={item.question} onChange={(e) => updateFaq(i, 'question', e.target.value)} />
                <TextArea label="Answer" value={item.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)} rows={2} />
              </div>
              <button type="button" onClick={() => removeFaq(i)} className="mt-6 rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addFaq}>
          <Plus size={15} /> Add Question
        </Button>
      </Section>

      <Section title="Privacy Policy">
        <TextArea label="Privacy Policy content" value={form.privacyContent} onChange={(e) => update('privacyContent', e.target.value)} rows={6} />
      </Section>

      <Section title="Terms of Service">
        <TextArea label="Terms of Service content" value={form.termsContent} onChange={(e) => update('termsContent', e.target.value)} rows={6} />
      </Section>

      <Section title="Social Media" description="Enter just the username/handle — KigaliHomes builds the link automatically. Leave blank to hide an icon in the footer.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Input label="Facebook username" value={form.socialFacebook} onChange={(e) => update('socialFacebook', e.target.value)} />
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><Facebook size={12} /> facebook.com/{form.socialFacebook || 'username'}</p>
          </div>
          <div>
            <Input label="X (Twitter) username" value={form.socialX} onChange={(e) => update('socialX', e.target.value)} />
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><Twitter size={12} /> x.com/{form.socialX || 'username'}</p>
          </div>
          <div>
            <Input label="Instagram username" value={form.socialInstagram} onChange={(e) => update('socialInstagram', e.target.value)} />
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><Instagram size={12} /> instagram.com/{form.socialInstagram || 'username'}</p>
          </div>
        </div>
      </Section>

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>Save All Changes</Button>
      </div>
    </form>
  );
}
