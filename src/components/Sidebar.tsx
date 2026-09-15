import React from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  FolderKanban, 
  Flame, 
  BarChart3, 
  Sparkles, 
  Thermometer, 
  UtensilsCrossed, 
  Bug, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { ActiveTab, Task } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tasks: Task[];
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  tasks,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const activeTasksCount = tasks.filter(t => t.status !== 'done').length;
  const criticalCount = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;
  const bugCount = tasks.filter(t => t.category === 'Bug & Equipment' && t.status !== 'done').length;
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const healthPercentage = Math.round((completedCount / (tasks.length || 1)) * 100);

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Task Management', icon: Kanban, badge: activeTasksCount, badgeColor: 'bg-neutral-800 text-neutral-300' },
    { id: 'projects', label: 'Projects & R&D', icon: FolderKanban },
    { id: 'matrix', label: 'Priorities Matrix', icon: Flame, badge: criticalCount > 0 ? criticalCount : undefined, badgeColor: 'bg-red-950 text-red-400 border border-red-800/60' },
    { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles, badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800/60' },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-40 h-full lg:h-[calc(100vh-61px)] w-64 bg-neutral-950/95 lg:bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile close banner */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-neutral-800">
            <span className="font-bold text-neutral-200 text-sm">Navigation Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs px-2.5 py-1 bg-neutral-800 rounded-md text-neutral-400 hover:text-neutral-200"
            >
              Close
            </button>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 tracking-wider">
              OPERATIONS WORKSPACE
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${item.badgeColor || 'bg-neutral-800 text-neutral-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Real-time Kitchen Stations Telemetry */}
          <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                Line Telemetry
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">LIVE SYNC</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Pizza Deck 1
                </span>
                <span className="font-mono text-neutral-200">485°F</span>
              </div>

              <div className="flex items-center justify-between text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Smash Griddle
                </span>
                <span className="font-mono text-neutral-200">410°F</span>
              </div>

              <div className="flex items-center justify-between text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Cold Proofing
                </span>
                <span className="font-mono text-neutral-200">38°F</span>
              </div>

              <div className="flex items-center justify-between text-neutral-400 pt-1 border-t border-neutral-800/60">
                <span className="flex items-center gap-1.5">
                  <Bug className="w-3 h-3 text-red-400" />
                  Equip Bugs
                </span>
                <span className={`font-mono font-bold ${bugCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {bugCount} active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Shift Meter */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span>Shift Completion</span>
            <span className="text-amber-400 font-bold">{healthPercentage}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(healthPercentage, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>{completedCount} of {tasks.length} resolved</span>
            <span className="text-neutral-400">AI Powered</span>
          </p>
        </div>
      </aside>
    </>
  );
};
