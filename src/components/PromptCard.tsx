import { useState } from 'react';
import type { Prompt } from '../types';
import { useAuth } from '../context/AuthContext';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
  priority?: boolean;
  onRequestLogin?: () => void;
  onRequestUnlock?: () => void;
}

const WARM_GRADIENTS_LIGHT = [
  { from: '#fde8e8', to: '#fff5f5' },
  { from: '#e8effe', to: '#f0f4ff' },
  { from: '#e8f5e8', to: '#f4fbf4' },
  { from: '#fef3e8', to: '#fffaf0' },
  { from: '#f0e8fe', to: '#f8f0ff' },
  { from: '#fde8f5', to: '#fff0f8' },
];

const DARK_GRADIENTS = [
  { from: '#1a0a1a', to: '#2a0e2a' },
  { from: '#0a0e2a', to: '#0e1840' },
  { from: '#0a1a0e', to: '#102a14' },
  { from: '#1a140a', to: '#2a1e0a' },
  { from: '#14081a', to: '#200e2a' },
  { from: '#1a0a14', to: '#2a0e1a' },
];

function gradientFor(id: string, isDark: boolean) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const pool = isDark ? DARK_GRADIENTS : WARM_GRADIENTS_LIGHT;
  return pool[Math.abs(hash) % pool.length];
}

async function writeToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // fall through to execCommand
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
    // silent — show ✓ optimistically
  }
}

export function PromptCard({ prompt, onClick, priority = false, onRequestLogin, onRequestUnlock }: PromptCardProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const canCopy = !!user?.paid;

  async function copyPrompt(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) { onRequestLogin?.(); return; }
    if (!canCopy) { onRequestUnlock?.(); return; }
    await writeToClipboard(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const coverImage = prompt.images[0];
  const hasImage = coverImage && !imgError;
  // Detect theme from document
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const grad = gradientFor(prompt.id, isDark);

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1"
      style={{ background: 'var(--bg-card)', borderRadius: '16px' }}
    >
      {/* Image or gradient card */}
      {hasImage ? (
        <img
          src={coverImage}
          alt={prompt.title}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full object-cover block"
          style={{ borderRadius: '16px 16px 0 0', display: 'block' }}
        />
      ) : (
        <div
          className="w-full p-4 min-h-[150px] flex flex-col justify-between"
          style={{
            background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
            borderRadius: '16px 16px 0 0',
          }}
        >
          <p
            className="text-xs leading-relaxed line-clamp-6 transition-all duration-300"
            style={{
              color: 'var(--body)',
              filter: !canCopy ? 'blur(3px)' : 'none',
              userSelect: !canCopy ? 'none' : 'auto',
            }}
          >
            {prompt.content}
          </p>
          <div className="mt-2">
            <span className="text-xs font-bold" style={{ color: 'var(--ash)' }}>Prompt</span>
          </div>
        </div>
      )}

      {/* Category overlay pill */}
      {prompt.categories[0] && (
        <div className="absolute top-2 left-2">
          <span
            className="px-3 py-1 text-xs font-bold"
            style={{
              background: 'var(--overlay-pill)',
              color: 'var(--overlay-pill-t)',
              borderRadius: '9999px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            {prompt.categories[0]}
          </span>
        </div>
      )}

      {/* Copy button — appears on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={copyPrompt}
          className="px-3 py-1.5 text-xs font-bold text-white transition-colors"
          style={{
            background: copied ? '#22c55e' : 'var(--primary)',
            borderRadius: '9999px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
          title={!user ? 'Sign in to copy' : !canCopy ? 'Unlock to copy' : undefined}
        >
          {!user ? '🔒' : !canCopy ? 'Unlock' : copied ? '✓' : 'Copy'}
        </button>
      </div>

      {/* Card metadata */}
      <div className="p-3">
        <h3
          className="text-sm font-semibold line-clamp-2 leading-snug mb-1"
          style={{ color: 'var(--ink)', letterSpacing: '-0.1px' }}
        >
          {prompt.title}
        </h3>
        <p className="text-xs truncate" style={{ color: 'var(--mute)' }}>
          {prompt.author.name}
        </p>
      </div>
    </div>
  );
}
