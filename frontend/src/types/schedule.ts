export type Priority = 'high' | 'normal' | 'low';

export interface Schedule {
  id: number;
  title: string;
  description: string | null;
  date: string;
  time: string;
  priority: Priority;
  completed: boolean;
}

export interface ScheduleRequest {
  title: string;
  description: string;
  date: string;
  time: string;
  priority: Priority;
}

export interface CompletionRequest {
  completed: boolean;
}

export type ScheduleView = 'dashboard' | 'all' | 'today' | 'completed' | 'settings';
