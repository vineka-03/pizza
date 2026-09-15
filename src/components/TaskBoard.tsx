import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Kanban as KanbanIcon, 
  List, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Flame, 
  ChevronRight, 
  ChevronLeft, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  Check, 
  Calendar,
  Sparkles,
  Bug,
  Utensils
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskCategory, Project } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenNewTask: () => void;
  onOpenAIChat: () => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTaskForEdit: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  projects,
  searchQuery,
  setSearchQuery,
  onOpenNewTask,
  onOpenAIChat,
  onUpdateTaskStatus,
  onSelectTaskForEdit,
  onDeleteTask,
  onToggleSubtask,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Categories list
  const categories: TaskCategory[] = [
    'Kitchen & Prep',
    'Menu & Recipes',
    'Delivery & Stock',
    'Bug & Equipment',
    'Staff & Rush',
  ];

  // Filtering
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesProject = selectedProject === 'all' || task.projectId === selectedProject;

    return matchesSearch && matchesCategory && matchesPriority && matchesProject;
  });

  const columns: { id: TaskStatus; title: string; color: string; badgeBg: string }[] = [
    { id: 'backlog', title: 'Backlog / Queue', color: 'border-neutral-700', badgeBg: 'bg-neutral-800 text-neutral-300' },
    { id: 'in_progress', title: 'On The Line / Active', color: 'border-amber-500/40', badgeBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
    { id: 'review', title: 'Taste / QA Check', color: 'border-blue-500/40', badgeBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
    { id: 'done', title: 'Shift Done', color: 'border-emerald-500/40', badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  ];

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'backlog') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'done';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'done') return 'review';
    if (current === 'review') return 'in_progress';
    if (current === 'in_progress') return 'backlog';
    return null;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Controls & Filter Bar */}
      <div className="flex flex-col gap-4 bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">Kitchen &amp; Ops Task Manager</h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
              {filteredTasks.length} tasks
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View switcher */}
            <div className="flex items-center p-1 bg-neutral-950 rounded-xl border border-neutral-800">
              <button
                id="view-kanban-btn"
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-neutral-800 text-amber-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Kanban Board View"
              >
                <KanbanIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                id="view-list-btn"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-neutral-800 text-amber-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="List / Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* AI Generator Shortcut */}
            <button
              id="taskboard-ai-copilot-btn"
              onClick={onOpenAIChat}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            {/* Add Task Button */}
            <button
              id="taskboard-add-task-btn"
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/80">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {cat === 'Bug & Equipment' && <Bug className="w-3 h-3 text-red-400" />}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Priority Filter */}
            <select
              id="filter-priority-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Project Filter */}
            <select
              id="filter-project-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500 max-w-[150px] truncate"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center space-y-3">
          <Utensils className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-neutral-200">No operational tasks match your filters</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Try adjusting search terms, priority, or category filters to see more tasks.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPriority('all');
                setSelectedProject('all');
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenNewTask}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400"
            >
              + Create New Task
            </button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl bg-neutral-900/50 border border-neutral-800 p-3.5 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-200">{col.title}</span>
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${col.badgeBg}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={onOpenNewTask}
                    className="p-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Add task to this status"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((task) => {
                    const isCritical = task.priority === 'critical';
                    const isHigh = task.priority === 'high';
                    const prevStatus = getPrevStatus(task.status);
                    const nextStatus = getNextStatus(task.status);
                    const completedSubs = task.subtasks.filter((s) => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        className="group relative rounded-xl bg-neutral-900 border border-neutral-800/90 hover:border-neutral-700 p-4 transition-all shadow-sm hover:shadow-md space-y-3"
                      >
                        {/* Priority & Category Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                isCritical
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                  : isHigh
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-neutral-800 text-neutral-300 truncate max-w-[120px]">
                              {task.category}
                            </span>
                          </div>

                          {/* Quick Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                            }}
                            className="text-neutral-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4
                            onClick={() => onSelectTaskForEdit(task)}
                            className="text-sm font-bold text-neutral-100 hover:text-amber-400 cursor-pointer transition-colors leading-snug"
                          >
                            {task.title}
                          </h4>
                          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Subtasks Progress */}
                        {task.subtasks.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px] text-neutral-400">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Subtasks
                              </span>
                              <span>
                                {completedSubs}/{task.subtasks.length}
                              </span>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.round((completedSubs / task.subtasks.length) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer: Due date, Assignee, Move Stage */}
                        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                          <div className="flex items-center gap-2">
                            <img
                              src={task.avatar}
                              alt={task.assignedTo}
                              className="w-6 h-6 rounded-full object-cover border border-neutral-700"
                              title={`Assigned to ${task.assignedTo}`}
                            />
                            <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[80px]">
                              {task.assignedTo.split(' ')[0]}
                            </span>
                          </div>

                          {/* Stage Mover */}
                          <div className="flex items-center gap-1">
                            {prevStatus && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, prevStatus)}
                                className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                                title={`Move back to ${prevStatus}`}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, nextStatus)}
                                className="p-1 rounded bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 transition-colors"
                                title={`Advance to ${nextStatus}`}
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Table View */
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Task Title &amp; Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredTasks.map((task) => {
                  const isCritical = task.priority === 'critical';
                  const isHigh = task.priority === 'high';

                  return (
                    <tr key={task.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() =>
                              onUpdateTaskStatus(task.id, task.status === 'done' ? 'in_progress' : 'done')
                            }
                            className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              task.status === 'done'
                                ? 'bg-emerald-500 border-emerald-500 text-neutral-950'
                                : 'border-neutral-700 hover:border-amber-400 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </button>
                          <div>
                            <span
                              onClick={() => onSelectTaskForEdit(task)}
                              className="font-bold text-neutral-100 hover:text-amber-400 cursor-pointer"
                            >
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
                              <span>{task.category}</span>
                              <span>&bull;</span>
                              <span>{task.subtasks.length} subtasks</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-neutral-200 outline-none focus:border-amber-500"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Taste/QA</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                            isCritical
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : isHigh
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={task.avatar}
                            alt={task.assignedTo}
                            className="w-5 h-5 rounded-full object-cover border border-neutral-700"
                          />
                          <span>{task.assignedTo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400 font-mono text-[11px]">
                        {task.dueDate}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectTaskForEdit(task)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg"
                            title="Edit task"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
