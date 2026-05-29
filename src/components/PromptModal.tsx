import { useEffect, useState } from 'react';
import type { Prompt } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { t } from '../i18n/translations';

interface PromptModalProps {
  prompt: Prompt | null;
  onClose: () => void;
  onRequestLogin?: () => void;
  onRequestUnlock?: () => void;
}

async function writeToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch {
    // silent
  }
}

export function PromptModal({ prompt, onClose, onRequestLogin, onRequestUnlock }: PromptModalProps) {
  const { user } = useAuth();
  const { lang } = useLang();
  const tr = t[lang];
  const [copied, setCopied] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => { setActiveImg(0); setCopied(false); setLightbox(false); }, [prompt]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(false);
        else onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, lightbox]);

  useEffect(() => {
    if (prompt) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [prompt]);

  if (!prompt) return null;

  const canCopy = !!user?.paid;

  async function copyPrompt() {
    if (!user) { onRequestLogin?.(); return; }
    if (!canCopy) { onRequestUnlock?.(); return; }
    await writeToClipboard(prompt!.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={prompt.images[activeImg]}
            alt={prompt.title}
            className="max-w-[95vw] max-h-[95vh] object-contain"
            style={{ borderRadius: '16px' }}
            onClick={e => e.stopPropagation()}
          />
          {prompt.images.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {prompt.images.map((img, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActiveImg(i); }}
                  className="w-12 h-12 overflow-hidden transition-all"
                  style={{
                    borderRadius: '8px',
                    border: activeImg === i ? '2px solid var(--primary)' : '2px solid transparent',
                    opacity: activeImg === i ? 1 : 0.5,
                  }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'var(--scrim)' }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: '32px',
            boxShadow: 'var(--shadow-modal)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            style={{ background: 'var(--chip-bg)', color: 'var(--ink)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--chip-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--chip-bg)')}
            title={tr.close}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image section */}
          {prompt.images.length > 0 && (
            <div style={{ background: 'var(--bg-card)', borderRadius: '32px 32px 0 0', overflow: 'hidden' }}>
              <div className="relative group cursor-zoom-in" onClick={() => setLightbox(true)}>
                <img
                  src={prompt.images[activeImg]}
                  alt={prompt.title}
                  className="w-full object-contain"
                  style={{ maxHeight: '420px' }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.15)' }}
                >
                  <div
                    className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5"
                    style={{ background: 'rgba(0,0,0,0.55)', borderRadius: '9999px' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    {tr.viewFullImage}
                  </div>
                </div>
              </div>
              {prompt.images.length > 1 && (
                <div className="flex gap-1.5 p-3 overflow-x-auto">
                  {prompt.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className="shrink-0 w-14 h-14 overflow-hidden transition-all"
                      style={{
                        borderRadius: '8px',
                        border: activeImg === i ? '2px solid var(--primary)' : '2px solid transparent',
                        opacity: activeImg === i ? 1 : 0.6,
                      }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-8 space-y-5">
            <div className="flex items-start gap-3 pr-8">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {prompt.categories.map(cat => (
                    <span
                      key={cat}
                      className="px-3 py-1 text-xs font-bold rounded-full"
                      style={{ background: 'var(--chip-bg)', color: 'var(--body)' }}
                    >
                      {cat}
                    </span>
                  ))}
                  <span
                    className="px-3 py-1 text-xs font-bold uppercase rounded-full"
                    style={{ background: 'var(--chip-bg)', color: 'var(--mute)' }}
                  >
                    {prompt.language}
                  </span>
                  {prompt.size && (
                    <span
                      className="px-3 py-1 text-xs font-bold rounded-full"
                      style={{ background: 'var(--chip-bg)', color: 'var(--mute)' }}
                    >
                      {prompt.size}
                    </span>
                  )}
                </div>
                <h2
                  className="text-xl font-semibold leading-snug"
                  style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}
                >
                  {prompt.title}
                </h2>
              </div>
            </div>

            {prompt.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--mute)' }}>
                {prompt.description}
              </p>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--ash)' }}
                >
                  {tr.promptText}
                </span>
                <button
                  onClick={copyPrompt}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-full transition-colors"
                  style={{ background: copied ? '#22c55e' : 'var(--primary)' }}
                  onMouseOver={e => { if (!copied) e.currentTarget.style.background = 'var(--primary-hover)'; }}
                  onMouseOut={e => { if (!copied) e.currentTarget.style.background = 'var(--primary)'; }}
                >
                  {!user ? tr.signInToReadBtn : !canCopy ? tr.unlockToReadBtn : copied ? tr.copiedPrompt : tr.copyPrompt}
                </button>
              </div>
              <pre
                className="text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap transition-all duration-300"
                style={{
                  background: 'var(--pre-bg)',
                  borderRadius: '16px',
                  padding: '16px',
                  color: 'var(--body)',
                  border: '1px solid var(--border-soft)',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                  filter: !canCopy ? 'blur(4px)' : 'none',
                  userSelect: !canCopy ? 'none' : 'auto',
                }}
              >
                {prompt.content}
              </pre>
            </div>

            <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '16px' }}>
              <p className="text-xs" style={{ color: 'var(--mute)' }}>
                Credit:{' '}
                {prompt.author.link ? (
                  <a
                    href={prompt.author.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold transition-colors"
                    style={{ color: 'var(--ink)' }}
                    onMouseOver={e => (e.currentTarget.style.color = 'var(--primary)')}
                    onMouseOut={e => (e.currentTarget.style.color = 'var(--ink)')}
                  >
                    {prompt.author.name}
                  </a>
                ) : (
                  <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                    {prompt.author.name}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
