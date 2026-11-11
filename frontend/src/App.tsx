import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Schedule, ScheduleRequest, ScheduleView } from './types/schedule';
import { createSchedule, deleteSchedule, getSchedules, setScheduleCompletion, updateSchedule } from './api/scheduleApi';
import { dateKey, today } from './utils/dates';
import Sidebar from './components/dashboard/Sidebar';
import Header from './components/dashboard/Header';
import WelcomeSection from './components/dashboard/WelcomeSection';
import StatsGrid from './components/dashboard/StatsGrid';
import CalendarPanel from './components/calendar/CalendarPanel';
import SchedulePanel from './components/schedule/SchedulePanel';
import ScheduleDialog from './components/schedule/ScheduleDialog';
import Toast from './components/common/Toast';

export default function App() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [view, setView] = useState<ScheduleView>('dashboard');
  const [query, setQuery] = useState('');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' }>({ message: '', kind: 'success' });
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    setToast({ message, kind });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((current) => current.message === message ? { ...current, message: '' } : current), 4200);
  }, []);

  const reloadSchedules = useCallback(async () => {
    setSchedules(await getSchedules());
  }, []);

  useEffect(() => {
    reloadSchedules().catch((error: Error) => showToast(`일정을 불러오지 못했습니다: ${error.message}`, 'error'));
  }, [reloadSchedules, showToast]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('.search-box input')?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const visibleSchedules = useMemo(() => {
    let items = [...schedules];
    if (query.trim()) {
      const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
      items = items.filter((item) => `${item.title} ${item.description || ''}`.toLocaleLowerCase('ko-KR').includes(normalizedQuery));
    } else if (view === 'today') {
      items = items.filter((item) => item.date === dateKey(today));
    } else if (view === 'completed') {
      items = items.filter((item) => item.completed);
    } else if (view === 'dashboard') {
      items = items.filter((item) => item.date === selectedDate);
    }
    return items.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [schedules, query, view, selectedDate]);

  const openDialog = (schedule: Schedule | null = null) => {
    setEditingSchedule(schedule);
    setDialogOpen(true);
  };

  const saveSchedule = async (payload: ScheduleRequest) => {
    try {
      if (editingSchedule) await updateSchedule(editingSchedule.id, payload);
      else await createSchedule(payload);
      const message = editingSchedule ? '일정을 수정했습니다.' : '일정을 등록했습니다.';
      setSelectedDate(payload.date);
      setCalendarMonth(new Date(`${payload.date}T12:00:00`));
      setDialogOpen(false);
      await reloadSchedules();
      showToast(message);
    } catch (error) {
      showToast((error as Error).message, 'error');
    }
  };

  const changeCompletion = async (schedule: Schedule, completed: boolean) => {
    try {
      await setScheduleCompletion(schedule.id, { completed });
      await reloadSchedules();
      showToast('완료 상태를 변경했습니다.');
    } catch (error) {
      showToast((error as Error).message, 'error');
    }
  };

  const removeSchedule = async (schedule: Schedule) => {
    if (!window.confirm(`“${schedule.title}” 일정을 삭제할까요?`)) return;
    try {
      await deleteSchedule(schedule.id);
      await reloadSchedules();
      showToast('일정을 삭제했습니다.');
    } catch (error) {
      showToast((error as Error).message, 'error');
    }
  };

  const selectView = (nextView: ScheduleView) => {
    setView(nextView);
    setSidebarOpen(false);
  };

  return <div className="app-shell">
    <Sidebar view={view} total={schedules.length} open={sidebarOpen} onSelect={selectView} onAdd={() => openDialog()} />
    <main className="main-area">
      <Header view={view} query={query} searchOpen={searchOpen} onQueryChange={setQuery} onSearchOpenChange={setSearchOpen} onAdd={() => openDialog()} onMenu={() => setSidebarOpen(true)} />
      <div className="content">
        <Toast message={toast.message} kind={toast.kind} />
        <WelcomeSection />
        <StatsGrid schedules={schedules} />
        <section className="dashboard-grid">
          <SchedulePanel schedules={visibleSchedules} view={view} selectedDate={selectedDate} query={query} onViewAll={() => selectView('all')} onAdd={() => openDialog()} onEdit={openDialog} onDelete={removeSchedule} onCompletion={changeCompletion} />
          <CalendarPanel schedules={schedules} month={calendarMonth} selectedDate={selectedDate} onMonthChange={setCalendarMonth} onDateSelect={(date, month) => { setSelectedDate(date); setCalendarMonth(month); }} onToday={() => { setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(dateKey(today)); }} />
        </section>
        <footer className="page-footer"><span>오늘의 계획, MySchedule과 함께</span><span>나의 일정과 목표를 한곳에서</span></footer>
      </div>
    </main>
    <div className={`mobile-scrim${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />
    {dialogOpen && <ScheduleDialog key={editingSchedule?.id ?? 'new'} schedule={editingSchedule} initialDate={selectedDate} onClose={() => setDialogOpen(false)} onSave={saveSchedule} />}
  </div>;
}
