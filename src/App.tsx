import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePrompts } from './hooks/usePrompts';
import { PromptCard } from './components/PromptCard';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';

import { PromptModal } from './components/PromptModal';
import type { Prompt } from './types';

const GITHUB_ICON = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLanguage] = useState('en');  // English by default
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  // ── Theme ──
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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

          {/* Right: count + theme toggle */}
          <div className="shrink-0 flex items-center gap-2">
            {!loading && data && (
              <span className="text-xs font-medium hidden md:block" style={{ color: 'var(--mute)' }}>
                {data.total.toLocaleString()} prompts
              </span>
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

      {/* ── Main ── */}
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-3 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
            />
            <p className="text-sm" style={{ color: 'var(--mute)' }}>กำลังโหลด prompt...</p>
          </div>
        ) : displayPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-16 h-16 flex items-center justify-center text-3xl rounded-full" style={{ background: 'var(--chip-bg)' }}>
              🔍
            </div>
            <p className="font-semibold" style={{ color: 'var(--ink)' }}>ไม่พบ prompt ที่ค้นหา</p>
            <p className="text-sm" style={{ color: 'var(--mute)' }}>ลองค้นหาคำอื่น หรือยกเลิกตัวกรอง</p>
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 sm:gap-3">
              {displayPrompts.slice(0, visibleCount).map((p, i) => (
                <div key={p.id} className="break-inside-avoid mb-2 sm:mb-3">
                  <PromptCard prompt={p} onClick={() => setSelectedPrompt(p)} priority={i < 8} />
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
        <div className="max-w-[1280px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" style={{ width: '20px', height: '20px' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
              SmartPrompt<span style={{ color: 'var(--primary)' }}>AI</span>
            </span>
            <span className="text-xs" style={{ color: 'var(--mute)' }}>© 2026</span>
          </div>
          <a
            href="https://github.com/Wiratcha2499-UTCC/ai-gallery-starter"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: 'var(--mute)' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--mute)')}
          >
            {GITHUB_ICON}
            Fork on GitHub
          </a>
        </div>
      </footer>

      <PromptModal prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} />
    </div>
  );
}
