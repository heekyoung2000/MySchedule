import type { Schedule } from '../../types/schedule';
import { addDays, dateKey, formatDate, today } from '../../utils/dates';

interface CalendarPanelProps {
  schedules: Schedule[];
  month: Date;
  selectedDate: string;
  onMonthChange: (month: Date) => void;
  onDateSelect: (date: string, month: Date) => void;
  onToday: () => void;
}

export default function CalendarPanel({ schedules, month, selectedDate, onMonthChange, onDateSelect, onToday }: CalendarPanelProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const start = new Date(year, monthIndex, 1 - firstDay.getDay());
  const monthTitle = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(month);
  const eventDates = new Set(schedules.map((item) => item.date));

  return (
    <article className="panel calendar-panel">
      <div className="panel-header calendar-heading"><div><h3>캘린더</h3><p className="panel-subtitle">월간 일정 한눈에 보기</p></div><div className="calendar-controls"><button className="icon-button" id="prev-month" aria-label="이전 달" onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}>‹</button><button className="icon-button" id="next-month" aria-label="다음 달" onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}>›</button></div></div>
      <div className="month-caption"><strong>{monthTitle}</strong><button id="go-today" className="today-button" type="button" onClick={onToday}>오늘</button></div>
      <div className="calendar-grid" role="grid" aria-label="월간 캘린더">
        {['일', '월', '화', '수', '목', '금', '토'].map((label) => <div className="weekday" role="columnheader" key={label}>{label}</div>)}
        {Array.from({ length: 42 }, (_, index) => {
          const date = addDays(start, index);
          const key = dateKey(date);
          const hasEvents = eventDates.has(key);
          const classes = ['day-cell', date.getMonth() !== monthIndex ? 'outside' : '', key === dateKey(today) ? 'today' : '', key === selectedDate ? 'selected' : ''].filter(Boolean).join(' ');
          return <button key={key} type="button" className={classes} role="gridcell" aria-label={`${formatDate(key, { year: 'numeric', month: 'long', day: 'numeric' })}${hasEvents ? ', 일정 있음' : ''}`} onClick={() => onDateSelect(key, new Date(date.getFullYear(), date.getMonth(), 1))}>
            {date.getDate()}{hasEvents && <span className="day-dots"><i className="day-dot" /></span>}
          </button>;
        })}
      </div>
      <div className="calendar-legend"><span><i className="legend-dot indigo" />일정 있음</span><span className="selected-caption">선택: {formatDate(selectedDate, { month: 'long', day: 'numeric' })}</span></div>
    </article>
  );
}
