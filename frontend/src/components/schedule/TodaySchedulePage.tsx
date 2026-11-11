import { Fragment, useEffect, useMemo, useState } from 'react';
import type { Schedule } from '../../types/schedule';
import { dateKey, formatTime } from '../../utils/dates';

interface TodaySchedulePageProps {
  schedules: Schedule[];
  loading: boolean;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onCompletion: (schedule: Schedule, completed: boolean) => void;
}

function getMinutes(value?: string | null): number | null {
  if (!value) return null;
  const [hours, minutes] = value.slice(0, 5).split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
}

function isUnspecified(schedule: Schedule) {
  return schedule.timeUnspecified ?? schedule.time == null;
}

function getClock(value: Date) {
  return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(value);
}

function getCategory(schedule: Schedule) {
  return schedule.category?.trim() || '분류 미설정';
}

function getPriority(priority: Schedule['priority']) {
  return priority === 'high' ? '높음' : priority === 'low' ? '낮음' : '보통';
}

function getStatus(schedule: Schedule, now: Date) {
  if (schedule.completed) return { label: '완료', className: 'completed' };
  const start = getMinutes(schedule.time);
  const end = getMinutes(schedule.endTime);
  const current = now.getHours() * 60 + now.getMinutes();
  if (start === null) return { label: '예정', className: 'planned' };
  if (end !== null && start <= current && current < end) return { label: '진행 중', className: 'progress' };
  return { label: current < start ? '예정' : '미완료', className: 'planned' };
}

function TimelineNowMarker({ time }: { time: string }) {
  return <div className="today-now-line" role="note" aria-label={`현재 시간 ${time}`}>
    <span className="today-now-label">현재 시간 <strong>{time.slice(0, 5)}</strong></span>
    <span className="today-now-rail"><i /></span>
  </div>;
}

export default function TodaySchedulePage({ schedules, loading, onEdit, onDelete, onCompletion }: TodaySchedulePageProps) {
  const [now, setNow] = useState(() => new Date());
  const [ascending, setAscending] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const todaySchedules = useMemo(() => schedules.filter((schedule) => schedule.date === dateKey(now)), [schedules, now]);
  const timelineSchedules = useMemo(() => todaySchedules
    .filter((schedule) => !isUnspecified(schedule) && getMinutes(schedule.time) !== null)
    .sort((a, b) => {
      const difference = (getMinutes(a.time) ?? 0) - (getMinutes(b.time) ?? 0);
      return ascending ? difference : -difference;
    }), [todaySchedules, ascending]);
  const timeUnspecifiedSchedules = todaySchedules.filter(isUnspecified);
  const completedCount = todaySchedules.filter((schedule) => schedule.completed).length;
  const remainingCount = todaySchedules.length - completedCount;
  const completionRate = todaySchedules.length === 0 ? 0 : Math.round((completedCount / todaySchedules.length) * 100);
  const currentTime = getClock(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const markerIndex = timelineSchedules.findIndex((schedule) => {
    const start = getMinutes(schedule.time);
    if (start === null) return false;
    return ascending ? start >= currentMinutes : start <= currentMinutes;
  });
  const dateLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(now);

  const stats = [
    { label: '전체 일정', value: todaySchedules.length, note: '오늘 등록된 일정', icon: '▣', variant: 'stat-indigo' },
    { label: '완료', value: completedCount, note: '오늘 완료한 일정', icon: '✓', variant: 'today-stat-white today-stat-done' },
    { label: '남은 일정', value: remainingCount, note: '아직 완료하지 않은 일정', icon: '⌛', variant: 'today-stat-white today-stat-remaining' },
  ];

  return <>
    <section className="welcome-row today-welcome">
      <div>
        <p className="date-kicker">{dateLabel}</p>
        <h2>오늘도 좋은 하루예요 <span className="wave">✦</span></h2>
        <p className="welcome-sub">지금은 <strong>{currentTime}</strong>입니다. 오늘도 화이팅하세요!</p>
      </div>
    </section>

    <section className="today-stats-grid" aria-label="오늘의 일정 요약">
      {stats.map((stat) => <article className={`stat-card ${stat.variant}`} key={stat.label}>
        <div className="stat-top"><span>{stat.label}</span><span className="stat-icon">{stat.icon}</span></div>
        <div className="stat-value">{stat.value}</div>
        <div className="stat-foot"><span className="stat-note">{stat.note}</span><span className="today-stat-arrow">→</span></div>
      </article>)}
    </section>

    <section className="today-layout">
      <article className="panel today-timeline-panel">
        <div className="panel-header today-panel-header">
          <div><div className="panel-title-row"><span className="today-panel-icon">▣</span><h3>오늘의 일정</h3><span className="section-badge">{timelineSchedules.length}</span></div><p className="panel-subtitle">시작 시간 순으로 확인해 보세요</p></div>
          <button className="today-sort-button" type="button" onClick={() => setAscending((value) => !value)} aria-label={ascending ? '시간 오름차순 정렬' : '시간 내림차순 정렬'}>
            시간순 정렬 <span>{ascending ? '⌄' : '⌃'}</span>
          </button>
        </div>
        <div className="today-timeline-list">
          {loading ? <div className="today-empty-state"><span className="today-panel-icon">…</span><strong>일정을 불러오는 중입니다.</strong></div>
            : timelineSchedules.length === 0 ? <><TimelineNowMarker time={currentTime} /><div className="today-empty-state"><span className="today-panel-icon">▣</span><strong>{todaySchedules.length === 0 ? '오늘 등록된 일정이 없습니다.' : '시간이 지정된 일정이 없습니다.'}</strong><p>{todaySchedules.length === 0 ? '상단의 일정 추가 버튼으로 오늘의 계획을 등록해 보세요.' : '시간 미설정 일정은 오른쪽 영역에서 확인할 수 있습니다.'}</p></div></>
              : <>
                {timelineSchedules.map((schedule, index) => <Fragment key={schedule.id}>
                  {index === markerIndex && <TimelineNowMarker time={currentTime} />}
                  <TodayTimelineRow schedule={schedule} now={now} onEdit={onEdit} onDelete={onDelete} onCompletion={onCompletion} />
                </Fragment>)}
                {markerIndex === -1 && <TimelineNowMarker time={currentTime} />}
              </>}
        </div>
      </article>

      <aside className="today-side-column">
        <article className="panel today-unscheduled-panel">
          <div className="panel-header today-panel-header">
            <div className="panel-title-row"><span className="today-panel-icon">◷</span><h3>시간 미설정 일정</h3></div>
            <span className="section-badge">{timeUnspecifiedSchedules.length}건</span>
          </div>
          <div className="today-unscheduled-list">
            {timeUnspecifiedSchedules.length === 0 ? <p className="today-side-empty">시간 미설정 일정이 없습니다.</p>
              : timeUnspecifiedSchedules.map((schedule) => <article className={`today-unscheduled-item${schedule.completed ? ' is-completed' : ''}`} key={schedule.id}>
                <span className="today-unscheduled-dot" />
                <div className="today-unscheduled-copy"><strong>{schedule.title}</strong><small>{schedule.description?.trim() || '설명 없음'}</small><small>{getCategory(schedule)} · 우선순위 {getPriority(schedule.priority)} · {schedule.completed ? '완료' : '미완료'}</small></div>
                <div className="today-unscheduled-actions">
                  <label className="today-completion-label"><input type="checkbox" checked={schedule.completed} onChange={(event) => onCompletion(schedule, event.target.checked)} aria-label={`${schedule.title} 완료 여부`} />완료</label>
                  <button type="button" onClick={() => onEdit(schedule)}>수정</button>
                  <button type="button" onClick={() => onDelete(schedule)}>삭제</button>
                </div>
              </article>)}
          </div>
        </article>

        <article className="panel today-summary-panel">
          <div className="panel-header today-panel-header"><div className="panel-title-row"><span className="today-panel-icon">▥</span><h3>오늘의 일정 요약</h3></div></div>
          <div className="today-progress-content">
            <div className="today-progress-ring" style={{ background: `conic-gradient(#635bdb ${completionRate * 3.6}deg, #eceef7 0deg)` }} aria-label={`오늘 일정 완료율 ${completionRate}%`}><div><strong>{completionRate}%</strong></div></div>
            <div className="today-progress-copy"><span>오늘 일정 완료율</span><p><strong>{completionRate}%</strong><small>({completedCount} / {todaySchedules.length}건)</small></p><div className="today-progress-track"><span style={{ width: `${completionRate}%` }} /></div></div>
          </div>
          <div className="today-encouragement"><span>☼</span><p>{todaySchedules.length === 0 ? '오늘의 일정을 추가해 보세요.' : completedCount === todaySchedules.length ? '오늘 일정이 모두 완료됐어요!' : '오늘도 수고하고 있어요!'}<br />{remainingCount > 0 ? '남은 일정도 화이팅하세요 🙂' : ''}</p></div>
        </article>
      </aside>
    </section>
  </>;
}

function TodayTimelineRow({ schedule, now, onEdit, onDelete, onCompletion }: {
  schedule: Schedule;
  now: Date;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onCompletion: (schedule: Schedule, completed: boolean) => void;
}) {
  const status = getStatus(schedule, now);
  return <div className={`today-timeline-row today-row-${status.className}`}>
    <div className="today-time-label"><strong>{formatTime(schedule.time || '')}</strong><span>~ {schedule.endTime ? formatTime(schedule.endTime) : '종료 미설정'}</span></div>
    <div className="today-timeline-rail"><i /></div>
    <article className="today-event-card">
      <div className="today-event-details">
        <div className="today-event-title"><strong>{schedule.title}</strong><span className={`today-status-pill today-status-${status.className}`}>{status.label}</span></div>
        <p>{schedule.description?.trim() || getCategory(schedule)} · 우선순위 {getPriority(schedule.priority)}</p>
      </div>
      <div className="event-actions">
        <input className="completion-toggle" type="checkbox" checked={schedule.completed} onChange={(event) => onCompletion(schedule, event.target.checked)} aria-label={`${schedule.title} 완료 여부`} />
        <button type="button" onClick={() => onEdit(schedule)}>수정</button>
        <button type="button" onClick={() => onDelete(schedule)}>삭제</button>
      </div>
    </article>
  </div>;
}
