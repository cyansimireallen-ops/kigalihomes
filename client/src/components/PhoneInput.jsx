import { useEffect, useState } from 'react';

// Common codes for KigaliHomes' primary market plus its neighbors and a few
// widely-used others. Kept short and relevant rather than all ~195 countries,
// since a shorter list is faster to use correctly.
export const COUNTRY_CODES = [
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+243', country: 'DR Congo', flag: '🇨🇩' },
  { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
];

const DEFAULT_CODE = '+250';

// Splits a full stored number like "+250795611238" into { code: '+250', local: '795611238' }.
// Falls back to the default code if the value doesn't start with a known one, or is empty/new.
function splitValue(value) {
  if (!value) return { code: DEFAULT_CODE, local: '' };
  const match = COUNTRY_CODES.find((c) => value.startsWith(c.code));
  if (match) return { code: match.code, local: value.slice(match.code.length).trim() };
  // Unrecognized prefix (e.g. old data saved without a code) — keep it all as the local part
  // rather than silently dropping digits, and default the code selector to Rwanda.
  return { code: DEFAULT_CODE, local: value.replace(/^\+/, '') };
}

/**
 * A phone number field with a country-code dropdown, so the code can't be forgotten.
 * `value`/`onChange` work like a normal text input: `value` is the FULL number
 * (e.g. "+250795611238") and `onChange` receives that same full string back —
 * drop-in compatible with existing `phone`/`contactPhone` form state.
 */
export default function PhoneInput({ label = 'Phone', value, onChange, error, placeholder = '78X XXX XXX' }) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [local, setLocal] = useState('');

  // Sync from parent when the full value changes from outside (e.g. loading an
  // existing user/property for editing) — but not on every local keystroke,
  // since we're the one generating those changes via handleCodeChange/handleLocalChange.
  useEffect(() => {
    const split = splitValue(value);
    setCode(split.code);
    setLocal(split.local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (nextCode, nextLocal) => {
    const digitsOnly = nextLocal.replace(/[^\d]/g, '');
    onChange(digitsOnly ? `${nextCode}${digitsOnly}` : '');
  };

  const handleCodeChange = (e) => {
    const nextCode = e.target.value;
    setCode(nextCode);
    emit(nextCode, local);
  };

  const handleLocalChange = (e) => {
    const nextLocal = e.target.value;
    setLocal(nextLocal);
    emit(code, nextLocal);
  };

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-charcoal">{label}</span>}
      <div className={`flex overflow-hidden rounded-lg border ${error ? 'border-red-400' : 'border-gray-300 focus-within:border-forest-500'}`}>
        <select
          value={code}
          onChange={handleCodeChange}
          aria-label="Country code"
          className="border-r border-gray-300 bg-gray-50 px-2 text-sm text-charcoal focus-ring"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={local}
          onChange={handleLocalChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm text-charcoal placeholder:text-gray-400 focus-ring"
        />
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
