import React from 'react';
import { User, ChevronDown, Trash2 } from 'lucide-react';

const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  HIGH: { label: 'High', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  MEDIUM: { label: 'Med', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  LOW: { label: 'Low', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30' }
};

export default function TaskCard({
  task,
  users = [],
  onDragStart,
  onAssignUser,
  onDeleteTask,
  onEditTask,
}) {
  const handleAssignChange = (e) => {
    e.stopPropagation();
    const selectedUserId = e.target.value ? Number(e.target.value) : null;
    onAssignUser(task.id, selectedUserId);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${task.title}"?`)) {
      onDeleteTask(task.id);
    }
  };

  const priorityMeta = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onEditTask(task)}
      className="group relative bg-slate-800/80 border border-slate-700/60 rounded-lg p-3.5 shadow-sm hover:shadow-md hover:border-slate-500 hover:bg-slate-800 transition-all cursor-pointer active:cursor-grabbing select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Replaced ID with Priority Badge */}
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${priorityMeta.bg}`}>
            {priorityMeta.label}
          </span>
          <button
            onClick={handleDelete}
            title="Delete task"
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition-all p-0.5 rounded"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Card Footer with User Selector */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
        <div 
          className="relative flex items-center gap-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/50 rounded-md px-2 py-1 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {task.assignee_avatar ? (
            <img
              src={task.assignee_avatar}
              alt={task.assignee_name}
              className="w-4 h-4 rounded-full border border-slate-600 bg-slate-700"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
              <User size={10} />
            </div>
          )}

          <span className="text-[11px] text-slate-300 truncate max-w-[100px]">
            {task.assignee_name || 'Unassigned'}
          </span>
          <ChevronDown size={11} className="text-slate-400" />

          <select
            value={task.assigned_user_id || ''}
            onChange={handleAssignChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [color-scheme:dark]"
          >
            <option value="" className="bg-slate-900 text-slate-200">
              Unassigned
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200 py-1">
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}