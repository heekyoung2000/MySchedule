import type { Schedule, ScheduleView } from '../../types/schedule';
import { dateKey, formatDate, formatTime, today } from '../../utils/dates';

interface SchedulePanelProps {
  schedules: Schedule[];
  view: ScheduleView;
  selectedDate: string;
  query: string;
  onViewAll: () => void;
  onAdd: () => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onCompletion: (schedule: Schedule, completed: boolean) => void;
}

export default function SchedulePanel({ schedules, view, selectedDate, query, onViewAll, onAdd, onEdit, onDelete, onCompletion }: SchedulePanelProps) {
  let title: string;
  let subtitle: string;
  if (query.trim()) {
    title = '검색 결과'; subtitle = `“${query.trim()}” 검색 결과입니다.`;
  } else if (view === 'dashboard') {
    title = selectedDate === dateKey(today) ? '오늘의 일정' : `${formatDate(selectedDate, { month: 'long', day: 'numeric' })} 일정`;
    subtitle = schedules.length ? '선택한 날짜의 일정을 확인해 보세요.' : '선택한 날짜에 등록된 일정이 없습니다.';
  } else {
    title = view === 'all' ? '전체 일정' : view === 'today' ? '오늘의 일정' : view === 'completed' ? '완료한 일정' : '설정';
    subtitle = view === 'today' ? '오늘 계획한 일정을 확인해 보세요.' : view === 'completed' ? '완료한 일정을 확인해 보세요.' : '등록된 일정을 확인해 보세요.';
  }

  return <article className="panel schedule-panel">
    <div className="panel-header"><div><div className="panel-title-row"><h3>{title}</h3><span className="section-badge">{schedules.length}</span></div><p className="panel-subtitle">{subtitle}</p></div><button className="text-button" id="view-all" type="button" onClick={onViewAll}>전체 보기 <span>→</span></button></div>
    <div className={`schedule-list${schedules.length ? '' : ' hidden'}`}>
      {schedules.map((item) => {
        const status = item.completed ? 'completed' : 'planned';
        const colors = ['indigo', 'blue', 'green', 'orange'];
        const color = colors[Number(item.id) % colors.length];
        const priorities = { high: '높음', normal: '보통', low: '낮음' };
        return <article className="event-row" key={item.id}>
          <div className="event-time"><strong>{formatTime(item.time || '')}</strong>{formatDate(item.date, { month: 'numeric', day: 'numeric' })}</div>
          <div className="event-main"><div className="event-title"><i className={`event-dot ${color}`} /><strong>{item.title}</strong></div><div className="event-description">{item.description || '설명이 없습니다.'}</div></div>
          <div className="event-meta"><span className={`status-pill status-${status}`}>{item.completed ? '완료' : '예정'}</span><span className={`priority-pill priority-${item.priority}`}>우선 {priorities[item.priority] || '보통'}</span>
            <div className="event-actions"><input className="completion-toggle" type="checkbox" checked={item.completed} onChange={(event) => onCompletion(item, event.target.checked)} aria-label={`${item.title} 완료 여부`} /><button type="button" onClick={() => onEdit(item)}>수정</button><button type="button" onClick={() => onDelete(item)}>삭제</button></div>
          </div>
        </article>;
      })}
    </div>
    {!schedules.length && <div className="empty-state"><div className="empty-icon">◷</div><strong>표시할 일정이 없어요</strong><p>새 일정을 추가하거나 다른 날짜를 선택해 보세요.</p><button className="text-button" id="empty-add" type="button" onClick={onAdd}>일정 추가하기 →</button></div>}
  </article>;
}
