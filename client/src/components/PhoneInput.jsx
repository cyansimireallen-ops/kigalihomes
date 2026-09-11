import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRY_CODES } from '../utils/countryCodes';

const DEFAULT_CODE = '+250';

// Splits a full stored number like "+250795611238" into { code: '+250', local: '795611238' }.
// Falls back to the default code if the value doesn't start with a known one, or is empty/new.
function splitValue(value) {
  if (!value) return { code: DEFAULT_CODE, local: '' };
  // Prefer the LONGEST matching code (e.g. Jamaica's +1876 over plain +1),
  // so overlapping prefixes among Caribbean/North American codes resolve correctly.
  const matches = COUNTRY_CODES.filter((c) => value.startsWith(c.code));
  const match = matches.sort((a, b) => b.code.length - a.code.length)[0];
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
 *
 * Uses a custom (non-native) dropdown rather than a plain <select> — native
 * <select>/<option> rendering on Windows does not display color flag emoji
 * (it falls back to plain regional-indicator letters), so a custom list is
 * used here to guarantee flags actually render everywhere.
 */
export default function PhoneInput({ label = 'Phone', value, onChange, error, placeholder = '78X XXX XXX' }) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [local, setLocal] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  // Sync from parent when the full value changes from outside (e.g. loading an
  // existing user/property for editing) — but not on every local keystroke,
  // since we're the one generating those changes via handleCodeSelect/handleLocalChange.
  useEffect(() => {
    const split = splitValue(value);
    setCode(split.code);
    setLocal(split.local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setSearch('');
      // Focus the search box right after the popover renders.
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const emit = (nextCode, nextLocal) => {
    const digitsOnly = nextLocal.replace(/[^\d]/g, '');
    onChange(digitsOnly ? `${nextCode}${digitsOnly}` : '');
  };

  const handleCodeSelect = (nextCode) => {
    setCode(nextCode);
    setOpen(false);
    emit(nextCode, local);
  };

  const handleLocalChange = (e) => {
    const nextLocal = e.target.value;
    setLocal(nextLocal);
    emit(code, nextLocal);
  };

  const selected = COUNTRY_CODES.find((c) => c.code === code) || COUNTRY_CODES[0];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) => c.country.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [search]);

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-charcoal">{label}</span>}
      <div
        ref={wrapperRef}
        className={`relative flex overflow-visible rounded-lg border ${
          error ? 'border-red-400' : 'border-gray-300 focus-within:border-forest-500'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex shrink-0 items-center gap-1 border-r border-gray-300 bg-gray-50 px-2 text-sm text-charcoal"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span>{selected.code}</span>
          <ChevronDown size={13} className="text-gray-400" />
        </button>

        <input
          type="tel"
          value={local}
          onChange={handleLocalChange}
          placeholder={placeholder}
          className="w-full rounded-r-lg px-3 py-2.5 text-sm text-charcoal placeholder:text-gray-400 focus-ring"
        />

        {open && (
          <div className="absolute left-0 top-full z-20 mt-1 w-72 max-w-[90vw] rounded-xl border border-gray-100 bg-white shadow-card">
            <div className="relative border-b border-gray-100 p-2">
              <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code"
                className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-2 text-sm focus-ring focus:border-forest-500"
              />
            </div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-gray-400">No matches</li>
              ) : (
                filtered.map((c) => (
                  <li key={`${c.iso2}-${c.code}`}>
                    <button
                      type="button"
                      onClick={() => handleCodeSelect(c.code)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        c.code === code ? 'bg-forest-50 text-forest-700' : 'text-charcoal'
                      }`}
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="flex-1 truncate">{c.country}</span>
                      <span className="text-gray-400">{c.code}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
