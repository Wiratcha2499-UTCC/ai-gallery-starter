import { useEffect, useState } from 'react';
import { useLang } from '../context/LangContext';
import { t } from '../i18n/translations';

interface UnlockModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export function UnlockModal({ open, onClose, userEmail, userName }: UnlockModalProps) {
  const { lang } = useLang();
  const tr = t[lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  async function handlePay() {
    if (!userEmail) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, name: userName }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to create checkout');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[55] overflow-y-auto"
      style={{ background: 'var(--scrim)' }}
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div
        className="relative w-full max-w-md p-8 flex flex-col gap-5"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '32px',
          boxShadow: 'var(--shadow-modal)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'var(--chip-bg)', color: 'var(--ink)' }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--chip-hover)')}
          onMouseOut={e => (e.currentTarget.style.background = 'var(--chip-bg)')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header — centered */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}>
            {tr.unlockTitle}
          </h2>
          <p className="text-sm" style={{ color: 'var(--mute)' }}>{tr.unlockSub}</p>
        </div>

        {/* Benefits */}
        <ul className="flex flex-col gap-3">
          {tr.benefits.map(b => (
            <li key={b} className="flex items-start gap-3">
              <span className="text-base mt-0.5">✅</span>
              <span className="text-sm leading-relaxed" style={{ color: 'var(--body)' }}>{b}</span>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-soft)' }} />

        {/* Price — centered, $4.99 on top */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-4xl font-bold" style={{ color: 'var(--ink)', letterSpacing: '-1.5px' }}>{tr.price}</span>
          <span className="text-sm" style={{ color: 'var(--mute)' }}>{tr.oneTime}</span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-center" style={{ color: '#dc2626' }}>⚠️ {error}</p>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-3 text-sm font-bold text-white rounded-full transition-colors flex items-center justify-center gap-2"
            style={{
              background: loading ? 'var(--mute)' : 'var(--primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-hover)'; }}
            onMouseOut={e => { if (!loading) e.currentTarget.style.background = 'var(--primary)'; }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {tr.redirecting}
              </>
            ) : (
              tr.payBtn
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium rounded-full transition-colors"
            style={{ background: 'var(--chip-bg)', color: 'var(--mute)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--chip-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--chip-bg)')}
          >
            {tr.cancel}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
