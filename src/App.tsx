import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { usePrompts } from './hooks/usePrompts';
import { PromptCard } from './components/PromptCard';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { PromptModal } from './components/PromptModal';
import { LoginModal } from './components/LoginModal';
import { UnlockModal } from './components/UnlockModal';
import { useAuth } from './context/AuthContext';
import { fetchPaidStatus } from './lib/pb';
import type { Prompt } from './types';


function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function App() {
  const { data, loading } = usePrompts();
  const { user, logout, pbError, refreshPaid } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLanguage] = useState('en');  // English by default
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [paymentBanner, setPaymentBanner] = useState<'success' | 'unlocked' | 'pending' | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Theme ──
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // ── Scroll-to-top button ──
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    function onScroll() { setShowTop(window.scrollY > 400); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // ── Payment success detection ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') !== 'true') return;
    window.history.replaceState({}, '', '/');
    setPaymentBanner('success');

    // 3-second confetti burst from both sides
    const end = Date.now() + 3000;
    const fireConfetti = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, zIndex: 9999 });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, zIndex: 9999 });
      if (Date.now() < end) requestAnimationFrame(fireConfetti);
    };
    requestAnimationFrame(fireConfetti);
    // Auto-dismiss banner after confetti ends
    setTimeout(() => setPaymentBanner(prev => prev === 'success' ? null : prev), 3500);

    let attempts = 0;
    pollRef.current = setInterval(async () => {
      if (!user?.email) return;
      attempts++;
      const result = await fetchPaidStatus(user.email);
      if (result?.paid) {
        clearInterval(pollRef.current!);
        await refreshPaid();
        setPaymentBanner('unlocked');
        setTimeout(() => setPaymentBanner(null), 6000);
      } else if (attempts >= 8) {
        clearInterval(pollRef.current!);
        setPaymentBanner('pending');
      }
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function goHome() {
    setSearchQuery('');
    setSelectedCategory(null);

    setVisibleCount(24);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Single-select category toggle
  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategory(prev => (prev === cat ? null : cat));
    setVisibleCount(24);
  }, []);

  const shuffled = useMemo(() => {
    const arr = [...(data?.prompts ?? [])];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [data]);

  const displayPrompts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return shuffled.filter(p =>
      (!selectedCategory || p.categories.includes(selectedCategory)) &&
      (!selectedLanguage  || p.language === selectedLanguage) &&
      (!q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  }, [shuffled, searchQuery, selectedCategory, selectedLanguage]);

  // Only show categories that have at least 1 visible (EN) prompt
  const availableCategories = useMemo(() => {
    if (!data) return [];
    const enPrompts = data.prompts.filter(p => p.language === selectedLanguage || !selectedLanguage);
    const cats = new Set<string>();
    enPrompts.forEach(p => p.categories.forEach(c => cats.add(c)));
    return data.categories.filter(c => cats.has(c));
  }, [data, selectedLanguage]);

  const selectedCategories = selectedCategory ? [selectedCategory] : [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)', color: 'var(--body)' }}>

      {/* ── Sticky top nav ── */}
      <header
        className="sticky top-0 z-40 transition-colors"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Main nav row */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center gap-3 sm:gap-4" style={{ height: '64px' }}>

          {/* Logo */}
          <button
            onClick={goHome}
            className="shrink-0 flex items-center gap-2.5 transition-opacity hover:opacity-75"
            aria-label="SmartPromptAI home"
          >
            <img src="/logo.svg" alt="SmartPromptAI" className="shrink-0" style={{ width: '36px', height: '36px' }} />
            <span className="font-bold text-base hidden sm:block" style={{ color: 'var(--ink)', letterSpacing: '-0.4px' }}>
              SmartPrompt<span style={{ color: 'var(--primary)' }}>AI</span>
            </span>
          </button>

          {/* Search */}
          <div className="flex-1 min-w-0 max-w-[560px]">
            <SearchBar value={searchQuery} onChange={v => { setSearchQuery(v); setVisibleCount(24); }} />
          </div>

          {/* Right: count + login/avatar + theme toggle */}
          <div className="shrink-0 flex items-center gap-2">
            {!loading && data && (
              <span className="text-xs font-medium hidden md:block" style={{ color: 'var(--mute)' }}>
                {data.total.toLocaleString()} prompts
              </span>
            )}

            {/* Auth area */}
            {user ? (
              <div className="flex items-center gap-2">
                <img
                  src={user.picture}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full shrink-0"
                  style={{ border: '2px solid var(--border)' }}
                />
                <span className="text-sm font-medium hidden sm:block max-w-[96px] truncate" style={{ color: 'var(--ink)' }}>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-xs px-2.5 py-1 rounded-full transition-colors"
                  style={{ background: 'var(--chip-bg)', color: 'var(--mute)' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--chip-hover)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--chip-bg)')}
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-1.5 text-sm font-bold text-white rounded-full transition-colors"
                style={{ background: 'var(--primary)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-hover)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--primary)')}
              >
                Sign in
              </button>
            )}

            <button
              onClick={() => setDarkMode(d => !d)}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
              style={{ background: 'var(--chip-bg)', color: 'var(--ink)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--chip-hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--chip-bg)')}
              title={darkMode ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>

        {/* Category filter row — single select + scroll buttons */}
        <div style={{ borderTop: '1px solid var(--border-soft)' }}>
          <div className="max-w-[1280px] mx-auto px-3 sm:px-6 py-2">
            <CategoryFilter
              categories={availableCategories}
              selected={selectedCategories}
              onToggle={toggleCategory}
            />
          </div>
        </div>

      </header>

      {/* ── DB error banner ── */}
      {pbError && (
        <div className="w-full px-4 py-2 text-xs font-medium text-center" style={{ background: '#fef2f2', color: '#dc2626', borderBottom: '1px solid #fecaca' }}>
          ⚠️ {pbError}
        </div>
      )}

      {/* ── Payment banners ── */}
      {paymentBanner === 'success' && (
        <div className="w-full px-4 py-2 text-sm font-bold text-center" style={{ background: '#f0fdf4', color: '#16a34a', borderBottom: '1px solid #bbf7d0' }}>
          🎉 Unlocked!
        </div>
      )}
      {paymentBanner === 'unlocked' && (
        <div className="w-full px-4 py-2 text-sm font-bold text-center" style={{ background: '#f0fdf4', color: '#16a34a', borderBottom: '1px solid #bbf7d0' }}>
          🎉 Unlocked!
        </div>
      )}
      {paymentBanner === 'pending' && (
        <div className="w-full px-4 py-2 text-xs font-medium text-center" style={{ background: '#fffbeb', color: '#92400e', borderBottom: '1px solid #fde68a' }}>
          Payment received — refresh the page if copy is not unlocked yet.
        </div>
      )}

      {/* ── Main ── */}
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-3 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
            />
            <p className="text-sm" style={{ color: 'var(--mute)' }}>Loading prompts...</p>
          </div>
        ) : displayPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-16 h-16 flex items-center justify-center text-3xl rounded-full" style={{ background: 'var(--chip-bg)' }}>
              🔍
            </div>
            <p className="font-semibold" style={{ color: 'var(--ink)' }}>No prompts found</p>
            <p className="text-sm" style={{ color: 'var(--mute)' }}>Try a different keyword or clear the filter</p>
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 sm:gap-3">
              {displayPrompts.slice(0, visibleCount).map((p, i) => (
                <div key={p.id} className="break-inside-avoid mb-2 sm:mb-3">
                  <PromptCard prompt={p} onClick={() => setSelectedPrompt(p)} priority={i < 8} onRequestLogin={() => setShowLoginModal(true)} onRequestUnlock={() => setShowUnlockModal(true)} />
                </div>
              ))}
            </div>

            {visibleCount < displayPrompts.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount(displayPrompts.length)}
                  className="px-8 py-3 text-sm font-bold transition-colors rounded-2xl"
                  style={{ background: 'var(--secondary-bg)', color: 'var(--ink)' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--secondary-hover)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--secondary-bg)')}
                >
                  Load all — {(displayPrompts.length - visibleCount).toLocaleString()} more
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-16 transition-colors" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-5 flex items-center gap-2">
            <img src="/logo.svg" alt="" style={{ width: '20px', height: '20px' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
              SmartPrompt<span style={{ color: 'var(--primary)' }}>AI</span>
            </span>
            <span className="text-xs" style={{ color: 'var(--mute)' }}>© 2026</span>
        </div>
      </footer>

      <PromptModal prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} onRequestLogin={() => setShowLoginModal(true)} onRequestUnlock={() => setShowUnlockModal(true)} />
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <UnlockModal open={showUnlockModal} onClose={() => setShowUnlockModal(false)} userEmail={user?.email} userName={user?.name} />

      {/* ── Scroll to top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-full shadow-lg transition-all duration-300"
        style={{
          background: 'var(--primary)',
          color: '#ffffff',
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? 'auto' : 'none',
          transform: showTop ? 'translateY(0)' : 'translateY(16px)',
        }}
        aria-label="Scroll to top"
        title="Back to top"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
