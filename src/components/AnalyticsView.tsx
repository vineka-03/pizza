import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Bug, 
  Copy, 
  Check, 
  ChefHat, 
  PieChart, 
  Activity,
  Calendar
} from 'lucide-react';
import { Task, Project } from '../types';

interface AnalyticsViewProps {
  tasks: Task[];
  projects: Project[];
  onOpenShiftSummary: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  projects,
  onOpenShiftSummary,
}) => {
  const [copied, setCopied] = useState(false);

  const total = tasks.length || 1;
  const completed = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const review = tasks.filter((t) => t.status === 'review').length;
  const backlog = tasks.filter((t) => t.status === 'backlog').length;
  const completionRate = Math.round((completed / total) * 100);

  // Categories Breakdown
  const categories = [
    'Kitchen & Prep',
    'Menu & Recipes',
    'Delivery & Stock',
    'Bug & Equipment',
    'Staff & Rush',
  ] as const;

  const categoryStats = categories.map((cat) => {
    const count = tasks.filter((t) => t.category === cat).length;
    const catDone = tasks.filter((t) => t.category === cat && t.status === 'done').length;
    return {
      name: cat,
      count,
      done: catDone,
      percent: Math.round((count / total) * 100),
    };
  });

  // Priorities Breakdown
  const priorities = ['critical', 'high', 'medium', 'low'] as const;
  const priorityStats = priorities.map((p) => ({
    name: p,
    count: tasks.filter((t) => t.priority === p).length,
    done: tasks.filter((t) => t.priority === p && t.status === 'done').length,
  }));

  // Equipment Bugs vs Culinary Tasks
  const bugTasks = tasks.filter((t) => t.category === 'Bug & Equipment');
  const bugsResolved = bugTasks.filter((t) => t.status === 'done').length;
  const bugResolutionRate = bugTasks.length > 0 ? Math.round((bugsResolved / bugTasks.length) * 100) : 100;

  // Copy Executive Report to Clipboard
  const handleCopyReport = () => {
    const reportText = `PIZZA & BURGER OPERATIONS REPORT
Date: ${new Date().toLocaleDateString()}
Shift Status: Peak Velocity

KPIS:
- Total Tasks: ${tasks.length}
- Completed: ${completed} (${completionRate}%)
- In Progress: ${inProgress}
- In QA / Review: ${review}
- Backlog: ${backlog}

EQUIPMENT & BUG RESOLUTION:
- Equipment Bugs Tracked: ${bugTasks.length}
- Bugs Resolved: ${bugsResolved} (${bugResolutionRate}%)

CATEGORY BREAKDOWN:
${categoryStats.map((c) => `- ${c.name}: ${c.count} items (${c.done} done)`).join('\n')}

PROJECT HEALTH:
${projects.map((p) => {
  const pTasks = tasks.filter((t) => t.projectId === p.id);
  const pDone = pTasks.filter((t) => t.status === 'done').length;
  return `- ${p.name}: ${pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0}% complete`;
}).join('\n')}
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900/70 border border-neutral-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">Progress Analytics &amp; Line Efficiency</h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              Shift Telemetry
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time completion metrics, station task distribution, and equipment bug resolution speed.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenShiftSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all border border-neutral-700"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Narrative Shift Brief</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md shadow-amber-500/20"
          >
            {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Report Copied!' : 'Export Shift Report'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-xs font-semibold text-neutral-400">SHIFT COMPLETION RATE</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{completionRate}%</span>
            <span className="text-xs text-neutral-400 font-medium">{completed} of {tasks.length}</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-xs font-semibold text-neutral-400">LINE DEFECT / BUG RESOLUTION</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{bugResolutionRate}%</span>
            <span className="text-xs text-neutral-400 font-medium">{bugsResolved}/{bugTasks.length} bugs cleared</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${bugResolutionRate}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-xs font-semibold text-neutral-400">STATION PIPELINE STAGES</span>
          <div className="flex items-center justify-between text-xs pt-1 text-neutral-300 font-mono">
            <span>{backlog} Backlog</span>
            <span>&rarr;</span>
            <span className="text-amber-400">{inProgress} Line</span>
            <span>&rarr;</span>
            <span className="text-blue-400">{review} QA</span>
          </div>
          <p className="text-[11px] text-neutral-400">Balanced flow across stations</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-xs font-semibold text-neutral-400">ESTIMATED PREP TIME REMAINING</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {tasks
                .filter((t) => t.status !== 'done')
                .reduce((acc, curr) => acc + (curr.estimatedMinutes || 30), 0)}{' '}
              <span className="text-base font-normal text-neutral-400">mins</span>
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">Calculated from remaining station tasks</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-orange-400" />
              Category Workload Distribution
            </h3>
            <span className="text-xs text-neutral-400">{categories.length} operational lines</span>
          </div>

          <div className="space-y-3.5">
            {categoryStats.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">{c.name}</span>
                  <span className="font-mono text-neutral-400">
                    {c.done}/{c.count} done ({c.percent}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{ width: `${Math.max(c.percent, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Health Funnel */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              Priority Triage Status
            </h3>
            <span className="text-xs text-neutral-400">Active queue breakdown</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {priorityStats.map((p) => {
              const isCrit = p.name === 'critical';
              const isHigh = p.name === 'high';
              return (
                <div
                  key={p.name}
                  className={`p-4 rounded-xl border ${
                    isCrit
                      ? 'bg-red-950/20 border-red-800/60'
                      : isHigh
                      ? 'bg-amber-950/20 border-amber-800/60'
                      : 'bg-neutral-950/60 border-neutral-800'
                  } space-y-1`}
                >
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block ${
                      isCrit ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-neutral-400'
                    }`}
                  >
                    {p.name}
                  </span>
                  <div className="text-2xl font-black text-white">{p.count}</div>
                  <div className="text-[11px] text-neutral-400">
                    {p.done} completed &bull; {p.count - p.done} active
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
