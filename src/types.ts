export type Role = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  native_lang: string;
  target_lang: string;
  cefr_level: string;
  learning_style: 'visual' | 'auditory' | 'analytical';
}

export interface StudentProfile {
  id: string; // matches User id
  streak: number;
  xp: number;
  dyslexia_mode: boolean;
  parent_email?: string;
  native_language?: string;
  current_level?: string;
  last_lesson_index?: number;
  last_active_tab?: string;
}

export interface Lesson {
  id: string;
  type: 'reading' | 'writing' | 'speaking' | 'listening' | 'vocabulary';
  language: string;
  cefr_level: string;
  content_json: string; // JSON string of the lesson content
  ai_generated: boolean;
}

export interface Assignment {
  id: string;
  student_id: string;
  content_ids: string[];
  due_date: string; // ISO date
  status: 'pending' | 'completed';
  ai_feedback?: string;
  score?: number;
}

export interface ProgressRecord {
  id: string;
  student_id: string;
  skill_type: string;
  metric: number;
  timestamp: string; // ISO date
}

export interface AdminInstruction {
  id: string;
  admin_id: string;
  command: string;
  parsed_intent?: string;
  target_ids?: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
