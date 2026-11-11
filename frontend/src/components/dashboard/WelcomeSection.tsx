import { getWeekLabel, today } from '../../utils/dates';

export default function WelcomeSection() {
  return (
    <section className="welcome-row">
      <div>
        <p className="date-kicker">{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(today)}</p>
        <h2>오늘도 좋은 하루예요 <span className="wave">✦</span></h2>
        <p className="welcome-sub">차근차근 계획하고, 중요한 일에 집중해 보세요.</p>
      </div>
      <div className="week-chip"><span className="live-dot" /><span>{getWeekLabel()}</span></div>
    </section>
  );
}
