import React, { useState, useEffect } from "react";
import KanbanBoard from "./components/KanbanBoard.jsx";
import CreateTaskModal from "./components/CreateTaskModal.jsx";
import ManageTeamModal from "./components/ManageTeamModal.jsx";
import SprintMetrics from "./components/SprintMetrics.jsx";
import { Layers, Plus, Users } from "lucide-react";
import { API_BASE_URL } from "./config/api.js";

export default function App() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchUsers = () => {
    fetch(`${API_BASE_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTaskCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleUserAdded = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
    // Refresh board to display the updated name on task cards
    setRefreshKey((prev) => prev + 1);
  };

  const handleUserDeleted = (deletedUserId) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedUserId));
    // Refresh board to unassign tasks that had this user
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col p-6 text-slate-100">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Sprint 1 - Supabase MVP
            </h1>
            <p className="text-xs text-slate-400">
              Active sprint workflow • Drag cards to reassign status
            </p>
          </div>
        </div>

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
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors shrink-0"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </header>

      {/* Main Board View */}
      <KanbanBoard
        sprintId={1}
        users={users}
        key={refreshKey}
        onTasksChange={(updated) => setTasks(updated)}
      />

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        sprintId={1}
        users={users}
      />

      {/* Team Management Modal with Edit & Delete */}
      <ManageTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        users={users}
        onUserAdded={handleUserAdded}
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
      />
    </main>
  );
}
