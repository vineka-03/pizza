import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TaskBoard } from './components/TaskBoard';
import { TaskModal } from './components/TaskModal';
import { ProjectView } from './components/ProjectView';
import { PriorityMatrixView } from './components/PriorityMatrixView';
import { AnalyticsView } from './components/AnalyticsView';
import { AIChatModal } from './components/AIChatModal';
import { AISummaryModal } from './components/AISummaryModal';
import { Task, Project, ActiveTab, TaskStatus, TaskPriority } from './types';
import { INITIAL_TASKS, INITIAL_PROJECTS } from './data/initialData';

export default function App() {
  // Persistence for tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pb_tasks_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    return INITIAL_TASKS;
  });

  // Persistence for projects
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('pb_projects_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
    return INITIAL_PROJECTS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [shiftSummaryOpen, setShiftSummaryOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('pb_tasks_data', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pb_projects_data', JSON.stringify(projects));
  }, [projects]);

  // Global hotkey '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save / Edit task
  const handleSaveTask = (task: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      if (exists) {
        return prev.map((t) => (t.id === task.id ? task : t));
      } else {
        return [task, ...prev];
      }
    });

    if (task.status === 'done') {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    showToast(`Task "${task.title.slice(0, 24)}..." saved`);
  };

  // Add multiple tasks from AI generator
  const handleAddMultipleTasks = (newTasks: Task[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
    showToast(`Added ${newTasks.length} AI-generated operational tasks to board`);
  };

  // Update single task status
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (newStatus === 'done' && t.status !== 'done') {
            confetti({
              particleCount: 50,
              spread: 65,
              origin: { y: 0.8 },
            });
          }
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  // Update task priority
  const handleUpdateTaskPriority = (taskId: string, newPriority: TaskPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
    showToast('Task priority updated');
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task removed from queue');
  };

  // Toggle subtask completion
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  // Apply AI reordering to active tasks
  const handleApplyAIPrioritization = (orderedIds: string[]) => {
    setTasks((prev) => {
      const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
      const active = prev.filter((t) => t.status !== 'done');
      const completed = prev.filter((t) => t.status === 'done');

      active.sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
        return orderA - orderB;
      });

      return [...active, ...completed];
    });

    showToast('AI Shift Prioritization applied successfully!');
  };

  // Create Project
  const handleAddProject = (newProj: Project) => {
    setProjects((prev) => [...prev, newProj]);
    showToast(`Project "${newProj.name}" created`);
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (window.confirm('Reset workspace tasks and projects to sample culinary data?')) {
      setTasks(INITIAL_TASKS);
      setProjects(INITIAL_PROJECTS);
      localStorage.removeItem('pb_tasks_data');
      localStorage.removeItem('pb_projects_data');
      showToast('Workspace reset to standard operations data');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/40 text-neutral-100 text-xs font-semibold shadow-xl shadow-neutral-950/60 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewTask={() => {
          setEditingTask(null);
          setTaskModalOpen(true);
        }}
        onOpenAIChat={() => setAiChatOpen(true)}
        onOpenShiftSummary={() => setShiftSummaryOpen(true)}
        onResetData={handleResetData}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        tasks={tasks}
      />

      {/* Main Layout: Sidebar + View Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tasks={tasks}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Dynamic View Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              projects={projects}
              setActiveTab={setActiveTab}
              onOpenNewTask={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
              onOpenAIChat={() => setAiChatOpen(true)}
              onOpenShiftSummary={() => setShiftSummaryOpen(true)}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onSelectTaskForEdit={(task) => {
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard
              tasks={tasks}
              projects={projects}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenNewTask={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
              onOpenAIChat={() => setAiChatOpen(true)}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onSelectTaskForEdit={(task) => {
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectView
              projects={projects}
              tasks={tasks}
              onAddProject={handleAddProject}
              setActiveTab={setActiveTab}
              onSelectTaskForEdit={(task) => {
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'matrix' && (
            <PriorityMatrixView
              tasks={tasks}
              onUpdateTaskPriority={handleUpdateTaskPriority}
              onSelectTaskForEdit={(task) => {
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
              onApplyAIPrioritization={handleApplyAIPrioritization}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              tasks={tasks}
              projects={projects}
              onOpenShiftSummary={() => setShiftSummaryOpen(true)}
            />
          )}

          {activeTab === 'assistant' && (
            <AIChatModal
              isInlineView={true}
              tasks={tasks}
              projects={projects}
              onAddTaskFromAI={handleSaveTask}
            />
          )}
        </main>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTask}
        onAddMultipleTasks={handleAddMultipleTasks}
        editingTask={editingTask}
        projects={projects}
      />

      {/* Floating AI Assistant Drawer/Modal (when triggered from Header or Dashboard) */}
      <AIChatModal
        isOpen={aiChatOpen && activeTab !== 'assistant'}
        isInlineView={false}
        onClose={() => setAiChatOpen(false)}
        tasks={tasks}
        projects={projects}
        onAddTaskFromAI={handleSaveTask}
      />

      {/* Shift Progress Summary Modal */}
      <AISummaryModal
        isOpen={shiftSummaryOpen}
        onClose={() => setShiftSummaryOpen(false)}
        tasks={tasks}
        projects={projects}
      />
    </div>
  );
}
