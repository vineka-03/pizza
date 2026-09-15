import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertTriangle, 
  FolderKanban, 
  User, 
  Tag, 
  ChefHat, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Task, Project, TaskCategory, TaskPriority, TaskStatus, Subtask } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Task) => void;
  onAddMultipleTasks?: (tasks: Task[]) => void;
  editingTask: Task | null;
  projects: Project[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  onAddMultipleTasks,
  editingTask,
  projects,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'ai'>('form');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Kitchen & Prep');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || 'proj-pizza-r-d');
  const [assignedTo, setAssignedTo] = useState('Chef Marco D.');
  const [dueDate, setDueDate] = useState('2026-09-18');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // AI Generator state
  const [aiObjective, setAiObjective] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedTasks, setAiGeneratedTasks] = useState<any[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const teamMembers = [
    { name: 'Chef Marco D.', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80' },
    { name: 'Chef Leo Vance', avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80' },
    { name: 'Elena Rostova (Ops Eng)', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
    { name: 'Carlos Mendez (Logistics)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  ];

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setCategory(editingTask.category);
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setProjectId(editingTask.projectId);
      setAssignedTo(editingTask.assignedTo);
      setDueDate(editingTask.dueDate);
      setEstimatedMinutes(editingTask.estimatedMinutes);
      setSubtasks(editingTask.subtasks || []);
      setTags(editingTask.tags || []);
      setActiveTab('form');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Kitchen & Prep');
      setStatus('backlog');
      setPriority('medium');
      setProjectId(projects[0]?.id || 'proj-pizza-r-d');
      setAssignedTo('Chef Marco D.');
      setDueDate(new Date().toISOString().split('T')[0]);
      setEstimatedMinutes(30);
      setSubtasks([]);
      setTags(['Kitchen']);
      setActiveTab('form');
      setAiGeneratedTasks([]);
      setAiError(null);
    }
  }, [editingTask, isOpen, projects]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, text: newSubtaskText.trim(), completed: false },
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (subId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subId));
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedMember = teamMembers.find((m) => m.name === assignedTo);
    const avatar = selectedMember
      ? selectedMember.avatar
      : 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80';

    const taskData: Task = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      priority,
      projectId,
      assignedTo,
      avatar,
      dueDate,
      estimatedMinutes,
      subtasks,
      tags,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
    };

    onSaveTask(taskData);
    onClose();
  };

  const handleGenerateWithAI = async () => {
    if (!aiObjective.trim()) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: aiObjective,
          category,
          projectId,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI generation failed (${res.status})`);
      }

      const data = await res.json();
      if (data.tasks && data.tasks.length > 0) {
        setAiGeneratedTasks(data.tasks);
      } else {
        setAiError('No tasks generated. Try modifying your prompt.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Failed to generate tasks with AI');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplySingleAITask = (t: any) => {
    setTitle(t.title);
    setDescription(t.description);
    if (t.category) setCategory(t.category);
    if (t.priority) setPriority(t.priority);
    if (t.estimatedMinutes) setEstimatedMinutes(t.estimatedMinutes);
    if (t.subtasks && Array.isArray(t.subtasks)) {
      setSubtasks(
        t.subtasks.map((st: string, idx: number) => ({
          id: `sub-ai-${Date.now()}-${idx}`,
          text: typeof st === 'string' ? st : (st as any).text || '',
          completed: false,
        }))
      );
    }
    setActiveTab('form');
  };

  const handleAddAllAITasks = () => {
    if (!onAddMultipleTasks || aiGeneratedTasks.length === 0) return;

    const newTasks: Task[] = aiGeneratedTasks.map((t, idx) => {
      const selectedMember = teamMembers[idx % teamMembers.length];
      return {
        id: `task-ai-${Date.now()}-${idx}`,
        title: t.title,
        description: t.description,
        category: t.category || category,
        status: 'backlog',
        priority: t.priority || 'medium',
        projectId,
        assignedTo: selectedMember.name,
        avatar: selectedMember.avatar,
        dueDate: new Date(Date.now() + (idx + 1) * 86400000).toISOString().split('T')[0],
        estimatedMinutes: t.estimatedMinutes || 30,
        subtasks: (t.subtasks || []).map((st: string, sIdx: number) => ({
          id: `sub-gen-${Date.now()}-${idx}-${sIdx}`,
          text: st,
          completed: false,
        })),
        tags: [category.split(' ')[0]],
        createdAt: new Date().toISOString(),
      };
    });

    onAddMultipleTasks(newTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                {editingTask ? 'Edit Operations Task' : 'New Operational Task'}
              </h3>
              <p className="text-xs text-neutral-400">
                {editingTask ? 'Update recipe, station task, or equipment bug' : 'Add task to pizza & burger workflow'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        {!editingTask && (
          <div className="flex border-b border-neutral-800 bg-neutral-950/30 px-6 pt-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'form'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Manual Form
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Task Generator</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        {activeTab === 'form' ? (
          <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Task Title *</label>
              <input
                id="task-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 72-Hour Biga Fermentation Setup Batch #15"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Operational Instructions &amp; Notes</label>
              <textarea
                id="task-desc-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specific temperatures, weights, calibration readings, or station protocols..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 outline-none resize-none"
              />
            </div>

            {/* Two Column Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Category</label>
                <select
                  id="task-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-neutral-100 outline-none"
                >
                  <option value="Kitchen & Prep">Kitchen &amp; Prep</option>
                  <option value="Menu & Recipes">Menu &amp; Recipes</option>
                  <option value="Delivery & Stock">Delivery &amp; Stock</option>
                  <option value="Bug & Equipment">Bug &amp; Equipment</option>
                  <option value="Staff & Rush">Staff &amp; Rush</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Priority Level</label>
                <select
                  id="task-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-neutral-100 outline-none"
                >
                  <option value="critical">Critical (Rush Priority / Line Down)</option>
                  <option value="high">High (Needs Shift Completion)</option>
                  <option value="medium">Medium (Standard Prep)</option>
                  <option value="low">Low (Backlog / Quality R&amp;D)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Board Status</label>
                <select
                  id="task-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-neutral-100 outline-none"
                >
                  <option value="backlog">Backlog / Queue</option>
                  <option value="in_progress">In Progress / On Line</option>
                  <option value="review">Taste &amp; QA Review</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              {/* Project Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Associated Project</label>
                <select
                  id="task-project-select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-neutral-100 outline-none truncate"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Assigned Cook / Lead</label>
                <select
                  id="task-assignee-select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-neutral-100 outline-none"
                >
                  {teamMembers.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date & Estimate */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-100 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Est. Mins</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Subtasks Builder */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span>Checklist / Station Subtasks</span>
                <span className="text-neutral-400 font-normal">
                  {subtasks.filter((s) => s.completed).length}/{subtasks.length} completed
                </span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add a step (e.g. Weigh salt, preheat flat top, test internal temp)"
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl"
                >
                  + Add Step
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/80 text-xs"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => handleToggleSubtask(st.id)}
                          className="rounded border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <span className={`truncate ${st.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                          {st.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="text-neutral-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <label className="text-xs font-bold text-neutral-300">Tags</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 text-neutral-500"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="+ add tag"
                    className="bg-transparent border-b border-neutral-700 text-xs text-neutral-200 px-1 py-0.5 outline-none w-20"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md shadow-amber-500/20"
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        ) : (
          /* AI Generator Tab */
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Gemini Culinary &amp; Operations AI</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Describe a culinary goal, prep need, or kitchen bug. The AI will breakdown actionable tasks with calibrated times and subtasks!
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300">What would you like the kitchen to accomplish?</label>
              <textarea
                rows={3}
                value={aiObjective}
                onChange={(e) => setAiObjective(e.target.value)}
                placeholder="e.g., 'Introduce a weekend smoked gouda smash burger with caramelized onions and calibrate patty sear temperature' OR 'Fix the pizza dough over-proofing in warm weather'"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Target Project: {projects[0]?.name}</span>
              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={aiLoading || !aiObjective.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 transition-all shadow-md shadow-amber-500/20"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Recipe &amp; Line...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Structured Tasks</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-400">
                {aiError}
              </div>
            )}

            {/* Generated Results */}
            {aiGeneratedTasks.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200">
                    Generated {aiGeneratedTasks.length} Operational Tasks:
                  </span>
                  {onAddMultipleTasks && (
                    <button
                      type="button"
                      onClick={handleAddAllAITasks}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors"
                    >
                      + Add All to Board
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {aiGeneratedTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300">
                              {t.priority}
                            </span>
                            <span className="text-[11px] text-neutral-400">{t.category}</span>
                            <span className="text-[11px] text-neutral-400">&bull; {t.estimatedMinutes}m</span>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-100">{t.title}</h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{t.description}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplySingleAITask(t)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 flex-shrink-0"
                        >
                          Use in Form
                        </button>
                      </div>

                      {t.subtasks && t.subtasks.length > 0 && (
                        <div className="text-[11px] text-neutral-400 bg-neutral-900/60 p-2 rounded-lg space-y-1">
                          <span className="font-semibold text-neutral-300 block">Checklist:</span>
                          <ul className="list-disc list-inside space-y-0.5">
                            {t.subtasks.map((st: string, sIdx: number) => (
                              <li key={sIdx} className="text-neutral-400">
                                {st}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
