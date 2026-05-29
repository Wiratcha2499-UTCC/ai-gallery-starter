interface LanguageSelectorProps {
  selected: string;
  onChange: (lang: string) => void;
}

const LANGS = [
  { code: '',   flag: '🌐', label: 'All'     },
  { code: 'th', flag: '🇹🇭', label: 'Thai'   },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'ja', flag: '🇯🇵', label: '日本語'   },
  { code: 'zh', flag: '🇨🇳', label: '中文'    },
];

export function LanguageSelector({ selected, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs font-bold shrink-0" style={{ color: 'var(--ash)' }}>Language:</span>
      {LANGS.map(lang => {
        const active = lang.code === selected;
        return (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-bold transition-colors rounded-full border"
            style={{
              background: active ? 'var(--primary)' : 'var(--chip-bg)',
              color: active ? '#ffffff' : 'var(--ink)',
              borderColor: active ? 'var(--primary)' : 'var(--border)',
            }}
            onMouseOver={e => {
              if (!active) e.currentTarget.style.background = 'var(--chip-hover)';
            }}
            onMouseOut={e => {
              if (!active) e.currentTarget.style.background = 'var(--chip-bg)';
            }}
            title={lang.label}
          >
            <span>{lang.flag}</span>
            <span className="hidden sm:inline">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}
