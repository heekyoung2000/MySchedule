import type { CompletionRequest, Schedule, ScheduleRequest } from '../types/schedule';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let detail = `요청에 실패했습니다. (${response.status})`;
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {
      // Use the same fallback message when the response is not JSON.
    }
    throw new Error(detail);
  }

  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

export const getHealth = () => request<{ status: string; application: string }>('/api/health');
export const getSchedules = () => request<Schedule[]>('/api/schedules');
export const createSchedule = (payload: ScheduleRequest) =>
  request<Schedule>('/api/schedules', { method: 'POST', body: JSON.stringify(payload) });
export const updateSchedule = (id: number, payload: ScheduleRequest) =>
  request<Schedule>(`/api/schedules/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteSchedule = (id: number) =>
  request<void>(`/api/schedules/${id}`, { method: 'DELETE' });
export const setScheduleCompletion = (id: number, payload: CompletionRequest) =>
  request<Schedule>(`/api/schedules/${id}/completion`, { method: 'PATCH', body: JSON.stringify(payload) });
