import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { login } = useAuth();

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

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center p-4"
      style={{ background: 'var(--scrim)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm p-8 flex flex-col items-center gap-6"
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

        {/* Lock icon */}
        <div
          className="w-14 h-14 flex items-center justify-center text-2xl rounded-full"
          style={{ background: 'var(--chip-bg)' }}
        >
          🔒
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}>
            Sign in to copy prompts
          </h2>
          <p className="text-sm" style={{ color: 'var(--mute)' }}>
            Use your Google account — it's free
          </p>
        </div>

        {/* Google Login */}
        <GoogleLogin
          onSuccess={cred => { login(cred); onClose(); }}
          onError={() => {}}
          useOneTap={false}
          shape="pill"
          size="large"
          text="signin_with"
        />
      </div>
    </div>
  );
}
