import type { Schedule } from '../../types/schedule';
import { dateKey, today } from '../../utils/dates';

export default function StatsGrid({ schedules }: { schedules: Schedule[] }) {
  const completed = schedules.filter((item) => item.completed).length;
  const stats = [
    { title: '오늘의 일정', value: schedules.filter((item) => item.date === dateKey(today)).length, icon: '◷', note: '오늘 예정된 일정', trend: '오늘', className: 'stat-indigo' },
    { title: '전체 일정', value: schedules.length, icon: '▤', note: '등록된 모든 일정', className: '', iconClass: 'icon-blue', dot: 'blue' },
    { title: '완료한 일정', value: completed, icon: '✓', note: '멋진 성과예요!', className: '', iconClass: 'icon-green', dot: 'green' },
    { title: '미완료 일정', value: schedules.length - completed, icon: '◌', note: '앞으로의 할 일', className: '', iconClass: 'icon-amber', dot: 'amber' },
  ];
  return (
    <section className="stats-grid" aria-label="일정 요약">
      {stats.map((stat) => <article key={stat.title} className={`stat-card ${stat.className}`}>
        <div className="stat-top"><span>{stat.title}</span><span className={`stat-icon ${stat.iconClass || ''}`}>{stat.icon}</span></div>
        <div className="stat-value">{stat.value}</div>
        <div className="stat-foot"><span className="stat-note">{stat.note}</span>{stat.trend ? <span className="trend">{stat.trend}</span> : <span className={`tiny-dot ${stat.dot}`} />}</div>
      </article>)}
    </section>
  );
}
