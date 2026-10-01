import React, { useState, useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard.jsx';
import CreateTaskModal from './components/CreateTaskModal.jsx';
import ManageTeamModal from './components/ManageTeamModal.jsx';
import CreateSprintModal from './components/CreateSprintModal.jsx';
import ManageSprintModal from './components/ManageSprintModal.jsx';
import SprintMetrics from './components/SprintMetrics.jsx';
import { Layers, Plus, Users, Settings2, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from './config/api.js';

export default function App() {
  const [sprints, setSprints] = useState([]);
  const [currentSprintId, setCurrentSprintId] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [isManageSprintOpen, setIsManageSprintOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch Sprints
  const fetchSprints = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sprints`);
      if (!res.ok) throw new Error('Failed to fetch sprints');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSprints(data);
        if (data.length > 0 && !currentSprintId) {
          setCurrentSprintId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Users
  const fetchUsers = () => {
    fetch(`${API_BASE_URL}/api/users`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSprints();
    fetchUsers();
  }, []);

  const currentSprint = sprints.find((s) => s.id === currentSprintId);

  // Sprint handlers
  const handleSprintCreated = (newSprint) => {
    setSprints((prev) => [...prev, newSprint]);
    setCurrentSprintId(newSprint.id);
  };

  const handleSprintUpdated = (updated) => {
    setSprints((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
  };

  const handleSprintDeleted = (deletedId) => {
    const remaining = sprints.filter((s) => s.id !== deletedId);
    setSprints(remaining);
    setCurrentSprintId(remaining.length > 0 ? remaining[0].id : null);
  };

  // User handlers
  const handleUserAdded = (newUser) => setUsers((prev) => [...prev, newUser]);
  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setRefreshKey((prev) => prev + 1);
  };
  const handleUserDeleted = (deletedUserId) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedUserId));
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col p-6 text-slate-100">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Layers size={22} />
          </div>

          <div>
            {/* Sprint Selector Dropdown */}
            <div className="flex items-center gap-2">
              {sprints.length > 0 ? (
                <>
                  <div className="relative inline-flex items-center">
                    <select
                      value={currentSprintId || ''}
                      onChange={(e) => setCurrentSprintId(Number(e.target.value))}
                      className="appearance-none bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-lg pl-3 pr-8 py-1 text-base font-bold text-slate-100 cursor-pointer focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                    >
                      {sprints.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 text-slate-400 pointer-events-none" />
                  </div>

                  {currentSprint && (
                    <button
                      onClick={() => setIsManageSprintOpen(true)}
                      title="Sprint Settings"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                    >
                      <Settings2 size={16} />
                    </button>
                  )}
                </>
              ) : (
                <span className="text-base font-bold text-slate-100">No Active Sprints</span>
              )}

              <button
                onClick={() => setIsCreateSprintOpen(true)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded hover:bg-indigo-950/40 transition-colors"
              >
                <Plus size={13} />
                New Sprint
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              {currentSprint?.goal || 'Create or select a sprint to manage tasks'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <SprintMetrics tasks={tasks} />

          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
          >
            <Users size={15} />
            Team ({users.length})
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            disabled={!currentSprintId}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors shrink-0"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </header>

      {/* Main Board View */}
      {currentSprintId ? (
        <KanbanBoard 
          sprintId={currentSprintId} 
          users={users}
          key={`${currentSprintId}-${refreshKey}`}
          onTasksChange={(updated) => setTasks(updated)} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-80 border border-dashed border-slate-800 rounded-xl text-slate-400 gap-3">
          <p className="text-sm">No active sprints found.</p>
          <button
            onClick={() => setIsCreateSprintOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            <Plus size={14} /> Create your first sprint
          </button>
        </div>
      )}

      {/* Task Creation Modal */}
      {currentSprintId && (
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskCreated={() => setRefreshKey((prev) => prev + 1)}
          sprintId={currentSprintId}
          users={users}
        />
      )}

      {/* Team Roster Modal */}
      <ManageTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        users={users}
        onUserAdded={handleUserAdded}
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
      />

      {/* Create Sprint Modal */}
      <CreateSprintModal
        isOpen={isCreateSprintOpen}
        onClose={() => setIsCreateSprintOpen(false)}
        onSprintCreated={handleSprintCreated}
      />

      {/* Manage/Edit Sprint Modal */}
      {currentSprint && (
        <ManageSprintModal
          isOpen={isManageSprintOpen}
          onClose={() => setIsManageSprintOpen(false)}
          sprint={currentSprint}
          onSprintUpdated={handleSprintUpdated}
          onSprintDeleted={handleSprintDeleted}
        />
      )}
    </main>
  );
}