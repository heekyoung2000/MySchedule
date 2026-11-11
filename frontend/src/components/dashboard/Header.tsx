import { useEffect, useRef } from 'react';
import type { ScheduleView } from '../../types/schedule';

const viewInfo: Record<ScheduleView, [string, string]> = {
  dashboard: ['대시보드', 'OVERVIEW'], all: ['전체 일정', 'ALL SCHEDULES'],
  today: ['오늘의 일정', 'TODAY'], completed: ['완료한 일정', 'COMPLETED'], settings: ['설정', 'PREFERENCES'],
};

interface HeaderProps {
  view: ScheduleView;
  query: string;
  searchOpen: boolean;
  onQueryChange: (query: string) => void;
  onSearchOpenChange: (open: boolean) => void;
  onAdd: () => void;
  onMenu: () => void;
}

export default function Header({ view, query, searchOpen, onQueryChange, onSearchOpenChange, onAdd, onMenu }: HeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  const [title, breadcrumb] = viewInfo[view];
  const today = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());

  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" id="menu-toggle" aria-label="메뉴 열기" onClick={onMenu}>☰</button>
      <div className="page-heading"><div className="eyebrow">MY WORKSPACE <span>／</span> <span>{breadcrumb}</span></div><h1>{title}</h1></div>
      <div className="top-actions">
        <label className={`search-box${searchOpen ? ' search-open' : ''}`} onClick={() => { if (window.matchMedia('(max-width: 560px)').matches) onSearchOpenChange(true); }}>
          <span>⌕</span><input ref={searchRef} type="search" placeholder="일정 검색..." aria-label="일정 검색" value={query} onChange={(event) => onQueryChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') { onQueryChange(''); event.currentTarget.blur(); } }} onBlur={() => { if (!query.trim()) onSearchOpenChange(false); }} /><kbd>⌘ K</kbd>
        </label>
        <span className="today-label">{today}</span>
        <button className="primary-button" id="add-event" type="button" onClick={onAdd}><span>＋</span> 일정 추가</button>
      </div>
    </header>
  );
}
