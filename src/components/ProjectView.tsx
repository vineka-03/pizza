import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers, 
  ChefHat, 
  Flame, 
  Bug, 
  Truck,
  Sparkles,
  X
} from 'lucide-react';
import { Project, Task, ActiveTab } from '../types';

interface ProjectViewProps {
  projects: Project[];
  tasks: Task[];
  onAddProject: (project: Project) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectTaskForEdit: (task: Task) => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({
  projects,
  tasks,
  onAddProject,
  setActiveTab,
  onSelectTaskForEdit,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Project['category']>('Pizza Innovation');
  const [color, setColor] = useState('#f97316');
  const [targetDate, setTargetDate] = useState('2026-10-31');
  const [lead, setLead] = useState('Chef Marco D.');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      color,
      targetDate,
      lead,
      leadAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    };

    onAddProject(newProj);
    setName('');
    setDescription('');
    setModalOpen(false);
  };

  const getCategoryIcon = (cat: Project['category']) => {
    switch (cat) {
      case 'Pizza Innovation':
        return <ChefHat className="w-4 h-4 text-orange-400" />;
      case 'Burger Bar Craft':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'Operations & Bugs':
        return <Bug className="w-4 h-4 text-red-400" />;
      case 'Delivery Fleet':
        return <Truck className="w-4 h-4 text-cyan-400" />;
      default:
        return <FolderKanban className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900/70 border border-neutral-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">Culinary Projects &amp; Operational Initiatives</h2>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-neutral-800 text-neutral-300">
              {projects.length} Active
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Track menu research, kitchen equipment reliability, and delivery packaging initiatives.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md shadow-amber-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Initiative</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {projects.map((proj) => {
          const projTasks = tasks.filter((t) => t.projectId === proj.id);
          const doneTasks = projTasks.filter((t) => t.status === 'done');
          const inProgressTasks = projTasks.filter((t) => t.status === 'in_progress');
          const completion = projTasks.length > 0 ? Math.round((doneTasks.length / projTasks.length) * 100) : 0;

          return (
            <div
              key={proj.id}
              className="rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-5 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
            >
              {/* Top Bar */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
                      {getCategoryIcon(proj.category)}
                      {proj.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {proj.targetDate}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Progress Bar & Stats */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Initiative Progress</span>
                  <span className="font-mono font-bold text-neutral-200">{completion}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${completion}%`, backgroundColor: proj.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                  <span>{doneTasks.length} done &bull; {inProgressTasks.length} in progress</span>
                  <span>{projTasks.length} total tasks</span>
                </div>
              </div>

              {/* Sample Tasks under Project */}
              <div className="space-y-1.5 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/60 text-xs">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Associated Station Tasks:
                </span>
                {projTasks.length === 0 ? (
                  <p className="text-neutral-500 italic text-[11px]">No tasks assigned yet.</p>
                ) : (
                  projTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTaskForEdit(t)}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-neutral-800/60 cursor-pointer transition-colors text-neutral-300"
                    >
                      <span className="truncate flex-1 font-medium">{t.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          t.status === 'done'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : t.status === 'in_progress'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Project Lead */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <img
                    src={proj.leadAvatar}
                    alt={proj.lead}
                    className="w-6 h-6 rounded-full object-cover border border-neutral-700"
                  />
                  <span>Lead: <strong className="text-neutral-200">{proj.lead}</strong></span>
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <span>Filter Board</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Project / R&amp;D Initiative</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-300">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sourdough Crust Hydration Upgrade"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Goals, target flavor profile, or operational reliability targets..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Project['category'])}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-neutral-100 outline-none"
                  >
                    <option value="Pizza Innovation">Pizza Innovation</option>
                    <option value="Burger Bar Craft">Burger Bar Craft</option>
                    <option value="Operations & Bugs">Operations &amp; Bugs</option>
                    <option value="Delivery Fleet">Delivery Fleet</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-300">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-neutral-100 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-300">Project Lead</label>
                <input
                  type="text"
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950"
                >
                  Create Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
