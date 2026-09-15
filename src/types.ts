export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskCategory = 
  | 'Kitchen & Prep'
  | 'Menu & Recipes'
  | 'Delivery & Stock'
  | 'Bug & Equipment'
  | 'Staff & Rush';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignedTo: string;
  avatar: string;
  dueDate: string;
  estimatedMinutes: number;
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: 'Pizza Innovation' | 'Burger Bar Craft' | 'Operations & Bugs' | 'Delivery Fleet';
  color: string;
  targetDate: string;
  lead: string;
  leadAvatar: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedTasks?: {
    title: string;
    description: string;
    category: TaskCategory;
    priority: TaskPriority;
    estimatedMinutes: number;
    subtasks: string[];
  }[];
}

export interface ShiftSummaryData {
  healthScore: number;
  headline: string;
  summary: string;
  keyWins: string[];
  actionItems: string[];
}

export type ActiveTab = 'dashboard' | 'tasks' | 'projects' | 'matrix' | 'analytics' | 'assistant';
