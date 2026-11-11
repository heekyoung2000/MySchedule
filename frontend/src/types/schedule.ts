export type Priority = 'high' | 'normal' | 'low';

export interface Schedule {
  id: number;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  endTime?: string | null;
  timeUnspecified?: boolean;
  category?: string | null;
  priority: Priority;
  completed: boolean;
}

export interface ScheduleRequest {
  title: string;
  description: string;
  date: string;
  time: string | null;
  endTime: string | null;
  timeUnspecified?: boolean;
  priority: Priority;
}

export interface CompletionRequest {
  completed: boolean;
}

export type ScheduleView = 'dashboard' | 'all' | 'today' | 'completed' | 'settings';
