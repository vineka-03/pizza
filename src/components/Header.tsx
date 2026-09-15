import React from 'react';
import { 
  Pizza, 
  Flame, 
  Search, 
  Sparkles, 
  Plus, 
  Menu, 
  X, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Task } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewTask: () => void;
  onOpenAIChat: () => void;
  onOpenShiftSummary: () => void;
  onResetData: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  tasks: Task[];
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenNewTask,
  onOpenAIChat,
  onOpenShiftSummary,
  onResetData,
  mobileMenuOpen,
  setMobileMenuOpen,
  tasks,
}) => {
  const criticalCount = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 rounded-lg lg:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-lg shadow-orange-500/20 text-neutral-950 font-black">
              <Pizza className="w-5 h-5 text-neutral-950 absolute -translate-x-1 -translate-y-1 rotate-[-12deg]" />
              <Flame className="w-4 h-4 text-amber-950 absolute translate-x-1.5 translate-y-1.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-neutral-100">
                  Pizza <span className="text-amber-500">&amp;</span> Burger
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-neutral-800 text-amber-400 border border-neutral-700/60 rounded-full tracking-wide">
                  OPS HUB
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium hidden md:block">
                Kitchen Operations &bull; Task Board &bull; AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, equipment bugs, recipes, staff... (Press /)"
              className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-9 py-2 text-sm text-neutral-200 placeholder-neutral-500 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Telemetry Badges & Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-neutral-400">Line Status:</span>
            <span className="font-semibold text-emerald-400">Rush Ready (485°F)</span>
          </div>

          {criticalCount > 0 && (
            <div 
              title={`${criticalCount} critical items require attention`}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{criticalCount} Critical</span>
            </div>
          )}

          {/* AI Shift Summary Button */}
          <button
            id="header-shift-summary-btn"
            onClick={onOpenShiftSummary}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 hover:text-white transition-all shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Shift Brief</span>
          </button>

          {/* AI Assistant Chat Button */}
          <button
            id="header-ai-assistant-btn"
            onClick={onOpenAIChat}
            className="relative inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 hover:from-amber-500/30 hover:via-orange-500/30 hover:to-red-500/30 border border-amber-500/40 text-amber-300 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>Ask AI</span>
          </button>

          {/* New Task Button */}
          <button
            id="header-new-task-btn"
            onClick={onOpenNewTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar on small screens */}
      <div className="mt-2.5 sm:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="mobile-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operations, bugs, dough..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
