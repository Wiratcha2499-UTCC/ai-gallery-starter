interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className="w-4 h-4" style={{ color: 'var(--mute)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search Prompt"
        className="w-full pl-10 pr-10 text-sm focus:outline-none transition-all"
        style={{
          height: '48px',
          borderRadius: '9999px',
          background: value ? 'var(--bg-surface)' : 'var(--chip-bg)',
          border: value ? '1px solid var(--border)' : '1px solid transparent',
          color: 'var(--ink)',
        }}
        onFocus={e => {
          e.currentTarget.style.background = 'var(--bg-surface)';
          e.currentTarget.style.border = '1px solid var(--border)';
          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(67,94,229,0.12)';
        }}
        onBlur={e => {
          if (!value) {
            e.currentTarget.style.background = 'var(--chip-bg)';
            e.currentTarget.style.border = '1px solid transparent';
          }
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          title="ล้างคำค้นหา"
          className="absolute inset-y-0 right-3 flex items-center transition-colors"
          style={{ color: 'var(--mute)' }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--mute)')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
