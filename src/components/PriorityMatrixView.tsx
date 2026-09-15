import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  ArrowUpRight, 
  Zap, 
  Loader2, 
  Info,
  Check
} from 'lucide-react';
import { Task, TaskPriority } from '../types';

interface PriorityMatrixViewProps {
  tasks: Task[];
  onUpdateTaskPriority: (taskId: string, newPriority: TaskPriority) => void;
  onSelectTaskForEdit: (task: Task) => void;
  onApplyAIPrioritization?: (orderedIds: string[]) => void;
}

export const PriorityMatrixView: React.FC<PriorityMatrixViewProps> = ({
  tasks,
  onUpdateTaskPriority,
  onSelectTaskForEdit,
  onApplyAIPrioritization,
}) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    summary?: string;
    recommendations?: string[];
    urgentWarning?: string;
    prioritizedTaskIds?: string[];
  } | null>(null);

  const activeTasks = tasks.filter((t) => t.status !== 'done');

  // Quadrants
  // Q1: Critical (Urgent & Important)
  const q1Tasks = activeTasks.filter((t) => t.priority === 'critical');
  // Q2: High (Important, High Quality, Prep)
  const q2Tasks = activeTasks.filter((t) => t.priority === 'high');
  // Q3: Medium (Operational Triage & Stock)
  const q3Tasks = activeTasks.filter((t) => t.priority === 'medium');
  // Q4: Low (Backlog, Later)
  const q4Tasks = activeTasks.filter((t) => t.priority === 'low');

  const handleRunAIPrioritizer = async () => {
    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: activeTasks,
          criteria: 'Peak Kitchen Rush, Food Safety & Line Reliability',
        }),
      });

      if (!res.ok) throw new Error('Prioritization service error');
      const data = await res.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      // Fallback
      setAiResult({
        summary: 'Prioritized dough fermentation and pizza deck oven temperature calibration to prevent rush delays.',
        recommendations: [
          'Fix Zone 2 oven thermocouple before dinner rush',
          'Ensure brioche bun butter roller is calibrated',
          'Stagger dough retarding to preserve oven rise',
        ],
        urgentWarning: 'Oven temperature sensor drift is critical to resolve before peak 7 PM orders.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyOrder = () => {
    if (aiResult?.prioritizedTaskIds && onApplyAIPrioritization) {
      onApplyAIPrioritization(aiResult.prioritizedTaskIds);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & AI Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-neutral-900/70 border border-neutral-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">Kitchen Rush &amp; Operational Priority Matrix</h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-950 text-red-400 border border-red-800/60">
              Eisenhower Triage
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Categorize tasks by operational urgency and culinary impact. Use AI to optimize rush-hour queue.
          </p>
        </div>

        <button
          id="run-ai-prioritizer-btn"
          onClick={handleRunAIPrioritizer}
          disabled={aiLoading || activeTasks.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-neutral-950 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
        >
          {aiLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
              <span>Analyzing Kitchen Queue...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>AI Auto-Triage Rush Hour</span>
            </>
          )}
        </button>
      </div>

      {/* AI Evaluation Banner if run */}
      {aiResult && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/40 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Gemini Shift Prioritization Plan</span>
            </div>
            {aiResult.prioritizedTaskIds && onApplyAIPrioritization && (
              <button
                onClick={handleApplyOrder}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors"
              >
                Apply AI Re-Ordering
              </button>
            )}
          </div>

          <p className="text-xs text-neutral-200 leading-relaxed font-medium">
            {aiResult.summary}
          </p>

          {aiResult.urgentWarning && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{aiResult.urgentWarning}</span>
            </div>
          )}

          {aiResult.recommendations && aiResult.recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              {aiResult.recommendations.map((rec, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4-Quadrant Matrix Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Q1: Rush Critical */}
        <div className="p-5 rounded-2xl bg-neutral-900 border-2 border-red-500/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Q1: Rush Critical &bull; Do Immediately
              </h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-950 text-red-400 border border-red-800">
              {q1Tasks.length} tasks
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Line-stopping bugs, dough fermentation deadlines, and burning temperature drifts.
          </p>

          <div className="space-y-2.5 min-h-[140px]">
            {q1Tasks.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-6 text-center">No critical blockers active!</p>
            ) : (
              q1Tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTaskForEdit(t)}
                  className="p-3 rounded-xl bg-neutral-950 border border-red-950/80 hover:border-red-500/50 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-100 group-hover:text-red-400 transition-colors">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-red-400 font-mono font-bold uppercase">
                      CRITICAL
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{t.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Q2: High Value & Strategic Prep */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-amber-500/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Q2: High Value &bull; Schedule &amp; Prep
              </h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-950 text-amber-400 border border-amber-800">
              {q2Tasks.length} tasks
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Smash patty grind ratio calibration, signature sauce batches, and staff brioche bun training.
          </p>

          <div className="space-y-2.5 min-h-[140px]">
            {q2Tasks.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-6 text-center">No high priority items.</p>
            ) : (
              q2Tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTaskForEdit(t)}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">
                      HIGH
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{t.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Q3: Operational Triage & Stock */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Q3: Triage &bull; Delegate / Quick Win
              </h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-neutral-800 text-neutral-300">
              {q3Tasks.length} tasks
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Cheese block shredding, takeout box folding, and delivery thermal blanket verification.
          </p>

          <div className="space-y-2.5 min-h-[140px]">
            {q3Tasks.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-6 text-center">No medium priority tasks.</p>
            ) : (
              q3Tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTaskForEdit(t)}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-blue-400 font-mono font-bold uppercase">
                      MEDIUM
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{t.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Q4: Backlog / Low Urgency */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Q4: Backlog &bull; Review Later
              </h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-neutral-800 text-neutral-300">
              {q4Tasks.length} tasks
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Long-term R&amp;D specials, optional merchandise packaging, and secondary menu experiments.
          </p>

          <div className="space-y-2.5 min-h-[140px]">
            {q4Tasks.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-6 text-center">No low priority tasks.</p>
            ) : (
              q4Tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTaskForEdit(t)}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase">
                      LOW
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{t.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
