import type { ScheduleView } from '../../types/schedule';

const views: { id: ScheduleView; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '▦', label: '대시보드' },
  { id: 'all', icon: '▤', label: '전체 일정' },
  { id: 'today', icon: '◷', label: '오늘의 일정' },
  { id: 'completed', icon: '✓', label: '완료한 일정' },
];

interface SidebarProps {
  view: ScheduleView;
  total: number;
  open: boolean;
  onSelect: (view: ScheduleView) => void;
  onAdd: () => void;
}

export default function Sidebar({ view, total, open, onSelect, onAdd }: SidebarProps) {
  return (
    <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
      <a className="brand" href="/" aria-label="MySchedule 홈">
        <span className="brand-mark"><span /><span /><span /><span /></span>
        <span>My<span className="brand-light">Schedule</span></span>
      </a>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="주 메뉴">
        {views.map(({ id, icon, label }) => (
          <a key={id} className={`nav-item${view === id ? ' active' : ''}`} href={`#${id}`} onClick={(event) => { event.preventDefault(); onSelect(id); }}>
            <span className="nav-icon">{icon}</span>{label}{id === 'all' && <span className="nav-count">{total}</span>}
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="side-label">PREFERENCES</div>
        <a className={`nav-item${view === 'settings' ? ' active' : ''}`} href="#settings" onClick={(event) => { event.preventDefault(); onSelect('settings'); }}><span className="nav-icon">⚙</span>설정</a>
        <div className="upgrade-card"><div className="upgrade-icon">✦</div><strong>하루를 계획해 보세요</strong><p>작은 계획이 큰 변화를 만들어요.</p><button id="sidebar-add" type="button" onClick={onAdd}>일정 추가 <span>＋</span></button></div>
        <div className="profile"><div className="avatar">나</div><div className="profile-copy"><strong>나의 워크스페이스</strong><span>개인 계정</span></div><span className="profile-more">···</span></div>
      </div>
    </aside>
  );
}
