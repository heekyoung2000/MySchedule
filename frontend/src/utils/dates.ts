export const today = new Date();
today.setHours(0, 0, 0, 0);

export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const addDays = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

export const formatDate = (
  key: string,
  options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'short' },
) => new Intl.DateTimeFormat('ko-KR', options).format(new Date(`${key}T12:00:00`));

export const formatTime = (time: string) => String(time || '').slice(0, 5);

export const getWeekLabel = () => {
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekEnd = addDays(weekStart, 6);
  return `${formatDate(dateKey(weekStart), { month: 'short', day: 'numeric' })} — ${formatDate(dateKey(weekEnd), { month: 'short', day: 'numeric' })}`;
};
