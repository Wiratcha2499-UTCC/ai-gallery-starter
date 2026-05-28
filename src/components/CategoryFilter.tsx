import { useRef } from 'react';

interface CategoryFilterProps {
  categories: string[];
  selected: string[];
  onToggle: (cat: string) => void;
}

export function CategoryFilter({ categories, selected, onToggle }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  if (categories.length === 0) return null;

  function scrollStep(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
  }

  function scrollEnd(dir: 'start' | 'end') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: dir === 'start' ? 0 : scrollRef.current.scrollWidth,
      behavior: 'smooth',
    });
  }

  function onMouseDown(e: React.MouseEvent) {
    drag.current = { active: true, startX: e.pageX, scrollLeft: scrollRef.current?.scrollLeft ?? 0 };
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drag.current.active || !scrollRef.current) return;
    scrollRef.current.scrollLeft = drag.current.scrollLeft - (e.pageX - drag.current.startX);
  }

  function stopDrag() {
    drag.current.active = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  }

  const activeCategory = selected[0] ?? null;

  return (
    <div className="group flex items-center gap-2">

      {/* "All" chip — pinned, always visible */}
      <button
        onClick={() => { if (activeCategory) onToggle(activeCategory); }}
        className="shrink-0 px-4 py-1.5 text-xs font-bold transition-colors rounded-full border"
        style={{
          background:  !activeCategory ? 'var(--ink)' : 'var(--chip-bg)',
          color:       !activeCategory ? 'var(--bg-page)' : 'var(--ink)',
          borderColor: !activeCategory ? 'var(--ink)' : 'var(--border)',
        }}
        onMouseOver={e => { if (activeCategory) e.currentTarget.style.background = 'var(--chip-hover)'; }}
        onMouseOut={e => { if (activeCategory) e.currentTarget.style.background = 'var(--chip-bg)'; }}
      >
        All
      </button>

      {/* Scroll region — buttons overlay chips */}
      <div className="relative flex-1 min-w-0">

        {/* Chips — no padding, full width */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 select-none"
          style={{ cursor: 'grab' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          {categories.map(cat => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onMouseDown={e => e.stopPropagation()}
                onClick={() => onToggle(cat)}
                className="shrink-0 px-4 py-1.5 text-xs font-bold transition-colors rounded-full border"
                style={{
                  background:  active ? 'var(--ink)' : 'var(--chip-bg)',
                  color:       active ? 'var(--bg-page)' : 'var(--ink)',
                  borderColor: active ? 'var(--ink)' : 'var(--border)',
                }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = 'var(--chip-hover)'; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = 'var(--chip-bg)'; }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Left overlay: gradient + «← buttons (appear on hover, sit on top of chips) */}
        <div className="absolute inset-y-0 left-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {/* gradient fade */}
          <div
            className="absolute inset-y-0 left-0 w-20 pointer-events-none"
            style={{ background: 'linear-gradient(to right, var(--bg-surface) 40%, transparent)' }}
          />
          {/* buttons on top of gradient */}
          <div className="relative flex items-center gap-0.5 pointer-events-auto">
            <button
              onClick={() => scrollEnd('start')}
              className="w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors"
              style={{ background: 'var(--bg-surface)', color: 'var(--ink)', border: '1px solid var(--border)' }}
              title="ไปสุดซ้าย"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollStep('left')}
              className="w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors"
              style={{ background: 'var(--bg-surface)', color: 'var(--ink)', border: '1px solid var(--border)' }}
              title="เลื่อนซ้าย"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right overlay: →» buttons + gradient (appear on hover, sit on top of chips) */}
        <div className="absolute inset-y-0 right-0 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {/* gradient fade */}
          <div
            className="absolute inset-y-0 right-0 w-20 pointer-events-none"
            style={{ background: 'linear-gradient(to left, var(--bg-surface) 40%, transparent)' }}
          />
          {/* buttons on top of gradient */}
          <div className="relative flex items-center gap-0.5 pointer-events-auto">
            <button
              onClick={() => scrollStep('right')}
              className="w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors"
              style={{ background: 'var(--bg-surface)', color: 'var(--ink)', border: '1px solid var(--border)' }}
              title="เลื่อนขวา"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => scrollEnd('end')}
              className="w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors"
              style={{ background: 'var(--bg-surface)', color: 'var(--ink)', border: '1px solid var(--border)' }}
              title="ไปสุดขวา"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
