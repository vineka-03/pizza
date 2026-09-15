import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Layers, 
  Utensils, 
  Bug, 
  Calendar, 
  Check, 
  Plus, 
  Activity,
  Zap,
  ChefHat
} from 'lucide-react';
import { Task, Project, ActiveTab } from '../types';

interface DashboardViewProps {
  tasks: Task[];
  projects: Project[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTask: () => void;
  onOpenAIChat: () => void;
  onOpenShiftSummary: () => void;
  onUpdateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
  onSelectTaskForEdit: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  projects,
  setActiveTab,
  onOpenNewTask,
  onOpenAIChat,
  onOpenShiftSummary,
  onUpdateTaskStatus,
  onSelectTaskForEdit,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const criticalTasks = tasks.filter((t) => t.priority === 'critical' && t.status !== 'done');
  const bugTasks = tasks.filter((t) => t.category === 'Bug & Equipment' && t.status !== 'done');
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Urgent / Critical or High priority tasks needing immediate action
  const urgentQueue = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const pOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Greeting & AI Executive Assist Quick Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-neutral-800 p-6 shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                DAILY KITCHEN &amp; OPS
              </span>
              <span className="text-xs text-neutral-400">Peak Shift Mode Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pizza &amp; Burger Operations Center
            </h1>
            <p className="text-neutral-400 text-sm max-w-2xl leading-relaxed">
              Real-time culinary task dispatch, dough proofing timelines, smash burger line calibrations, and AI-powered shift optimization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dash-ai-summary-btn"
              onClick={onOpenShiftSummary}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold transition-all shadow-sm hover:border-neutral-600"
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Shift Progress Summary</span>
            </button>
            <button
              id="dash-ai-chat-btn"
              onClick={onOpenAIChat}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-neutral-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>AI Operations Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold tracking-wider text-neutral-400">ACTIVE TASKS</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{inProgressTasks + (totalTasks - completedTasks - inProgressTasks)}</span>
            <span className="text-xs text-neutral-400 font-medium">/ {totalTasks} total</span>
          </div>
          <p className="mt-2 text-xs text-neutral-400 flex items-center gap-1">
            <span className="text-amber-400 font-semibold">{inProgressTasks} currently</span> on the line
          </p>
        </div>

        {/* Completion Velocity */}
        <div 
          onClick={() => setActiveTab('analytics')}
          className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold tracking-wider text-neutral-400">COMPLETION RATE</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{completionRate}%</span>
            <span className="text-xs text-emerald-500/80 font-medium">{completedTasks} resolved</span>
          </div>
          <div className="mt-2.5 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Critical Rush Alerts */}
        <div 
          onClick={() => setActiveTab('matrix')}
          className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold tracking-wider text-neutral-400">CRITICAL RUSH</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-400">{criticalTasks.length}</span>
            <span className="text-xs text-red-400/80 font-semibold">Immediate attention</span>
          </div>
          <p className="mt-2 text-xs text-neutral-400 flex items-center justify-between">
            <span>Requires action before rush</span>
            <span className="text-red-400 text-xs font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </p>
        </div>

        {/* Equipment Bugs & Glitches */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold tracking-wider text-neutral-400">EQUIPMENT / BUGS</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{bugTasks.length}</span>
            <span className="text-xs text-neutral-400 font-medium">line issues</span>
          </div>
          <p className="mt-2 text-xs text-neutral-400 flex items-center gap-1">
            <span>Deck oven &bull; KDS screen</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Urgent Rush Tasks & Kitchen Station Live Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Operational Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h2 className="text-base font-bold text-neutral-100">Urgent Kitchen Rush &amp; Ops Queue</h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {urgentQueue.length === 0 ? (
              <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center text-neutral-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold">All urgent tasks are resolved for this shift!</p>
              </div>
            ) : (
              urgentQueue.map((task) => {
                const isCritical = task.priority === 'critical';
                const isHigh = task.priority === 'high';
                const completedSubs = task.subtasks.filter((s) => s.completed).length;

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-neutral-900 border border-neutral-800/90 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, task.status === 'done' ? 'in_progress' : 'done')}
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          task.status === 'done'
                            ? 'bg-emerald-500 border-emerald-500 text-neutral-950'
                            : 'border-neutral-700 hover:border-amber-400 text-transparent'
                        }`}
                        title="Toggle task completion"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
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
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-neutral-800 text-neutral-300">
                            {task.category}
                          </span>
                          {task.category === 'Bug & Equipment' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-950 text-red-300 border border-red-800/60">
                              BUG
                            </span>
                          )}
                        </div>

                        <h3 
                          onClick={() => onSelectTaskForEdit(task)}
                          className="text-sm font-semibold text-neutral-100 hover:text-amber-400 cursor-pointer truncate transition-colors"
                        >
                          {task.title}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{task.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80">
                      {task.subtasks.length > 0 && (
                        <div className="text-xs text-neutral-400 font-medium">
                          {completedSubs}/{task.subtasks.length} steps
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <img
                          src={task.avatar}
                          alt={task.assignedTo}
                          className="w-6 h-6 rounded-full object-cover border border-neutral-700"
                          title={`Assigned to ${task.assignedTo}`}
                        />
                        <span className="text-xs text-neutral-400 hidden sm:inline max-w-[90px] truncate">
                          {task.assignedTo.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Station Telemetry & Projects Snapshot */}
        <div className="space-y-6">
          {/* Pizza & Burger Station Diagnostics */}
          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-neutral-100">Live Kitchen Line Telemetry</h3>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Deck Oven */}
              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-neutral-200">Woodstone Pizza Deck 1 &amp; 2</span>
                  <span className="font-mono text-amber-400 font-bold">485°F / 508°F</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Zone 2 offset +18°F</span>
                  <span className="text-red-400 font-semibold">Sensor Calib In Progress</span>
                </div>
              </div>

              {/* Smash Burger Griddle */}
              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-neutral-200">Chrome Flat-Top Smash Griddle</span>
                  <span className="font-mono text-emerald-400 font-bold">410°F OPTIMAL</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Weighted presses ready</span>
                  <span className="text-emerald-400">90s sear cycle</span>
                </div>
              </div>

              {/* Cold Room & Proofing */}
              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-neutral-200">Walk-In Dough Retarder</span>
                  <span className="font-mono text-cyan-400 font-bold">38.2°F / 85% RH</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Caputo 00 Batch #42</span>
                  <span className="text-neutral-300">42 dough balls ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Projects Quick Card */}
          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100">Active R&amp;D Projects</h3>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => {
                const projTasks = tasks.filter((t) => t.projectId === proj.id);
                const projDone = projTasks.filter((t) => t.status === 'done').length;
                const percent = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;

                return (
                  <div key={proj.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-200 truncate max-w-[170px]">{proj.name}</span>
                      <span className="font-mono text-neutral-400">{percent}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: proj.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
