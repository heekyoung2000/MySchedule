import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Schedule, ScheduleRequest } from '../../types/schedule';
import { formatTime } from '../../utils/dates';

interface ScheduleDialogProps {
  schedule: Schedule | null;
  initialDate: string;
  onClose: () => void;
  onSave: (payload: ScheduleRequest) => Promise<void>;
}

const blankForm = (date: string): ScheduleRequest => ({
  title: '', description: '', date, time: '10:00', endTime: '11:00', timeUnspecified: false, priority: 'normal',
});

export default function ScheduleDialog({ schedule, initialDate, onClose, onSave }: ScheduleDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ScheduleRequest>(() => blankForm(initialDate));

  useEffect(() => {
    const timeUnspecified = schedule?.timeUnspecified ?? schedule?.time == null;
    setForm({
      title: schedule?.title || '',
      description: schedule?.description || '',
      date: schedule?.date || initialDate,
      time: schedule ? formatTime(schedule.time || '') : '10:00',
      endTime: schedule ? formatTime(schedule.endTime || '') : '11:00',
      timeUnspecified,
      priority: schedule?.priority || 'normal',
    });
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    titleRef.current?.focus();
  }, [schedule, initialDate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const preserveLegacyTimedSchedule = Boolean(schedule && !schedule.timeUnspecified && schedule.time && !schedule.endTime && !form.timeUnspecified);
      await onSave({
        ...form,
        time: form.timeUnspecified ? null : form.time,
        endTime: form.timeUnspecified ? null : form.endTime,
        timeUnspecified: preserveLegacyTimedSchedule ? undefined : form.timeUnspecified,
      });
    } finally {
      setSaving(false);
    }
  };

  return <dialog ref={dialogRef} className="event-dialog" aria-labelledby="dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <form onSubmit={submit}>
      <div className="dialog-header"><div><div className="eyebrow">MY SCHEDULE</div><h2 id="dialog-title">{schedule ? '일정 수정' : '새 일정 만들기'}</h2></div><button className="icon-button close-dialog" type="button" aria-label="닫기" onClick={onClose}>×</button></div>
      <label className="field-label">일정 제목<input ref={titleRef} name="title" required maxLength={80} placeholder="예: 주간 기획 회의" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label className="field-label">설명 <span className="optional">선택</span><textarea name="description" rows={3} maxLength={240} placeholder="일정에 대한 간단한 메모를 남겨보세요" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <label className="field-label">날짜<input name="date" type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
      <label className="time-unspecified-toggle"><input name="timeUnspecified" type="checkbox" checked={form.timeUnspecified} onChange={(event) => setForm({ ...form, timeUnspecified: event.target.checked })} /> <span>시간 미설정</span></label>
      <div className="field-row"><label className="field-label">시작 시간<input name="time" type="time" required={!form.timeUnspecified} disabled={form.timeUnspecified} value={form.time || ''} onChange={(event) => setForm({ ...form, time: event.target.value })} /></label><label className="field-label">종료 시간<input name="endTime" type="time" required={!form.timeUnspecified && (!schedule || Boolean(schedule.endTime))} disabled={form.timeUnspecified} value={form.endTime || ''} onChange={(event) => setForm({ ...form, endTime: event.target.value })} /></label></div>
      <label className="field-label">우선순위<select name="priority" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as ScheduleRequest['priority'] })}><option value="normal">보통</option><option value="high">높음</option><option value="low">낮음</option></select></label>
      <div className="dialog-actions"><button className="secondary-button close-dialog" type="button" onClick={onClose}>취소</button><button className="primary-button" id="save-event" type="submit" disabled={saving}>{saving ? '저장 중...' : schedule ? '변경 사항 저장' : '일정 등록'}</button></div>
    </form>
  </dialog>;
}
