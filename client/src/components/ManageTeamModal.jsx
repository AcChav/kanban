import React, { useState } from 'react';
import { X, UserPlus, User, Edit2, Trash2, Check } from 'lucide-react';
import { API_BASE_URL } from '../config/api.js';

export default function ManageTeamModal({
  isOpen,
  onClose,
  users,
  onUserAdded,
  onUserUpdated,
  onUserDeleted,
}) {
  const [name, setName] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create team member');

      const created = await res.json();
      onUserAdded(created);
      setName('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditName(user.name);
  };

  const handleSaveEdit = async (userId) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update member name');

      const updated = await res.json();
      onUserUpdated(updated);
      setEditingUserId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Remove ${user.name} from the team? Any assigned tasks will become unassigned.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete member');

      onUserDeleted(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">Team Roster</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Existing Users List */}
        <div className="mt-4 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt={u.name}
                    className="w-7 h-7 rounded-full border border-slate-600 bg-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    <User size={14} />
                  </div>
                )}

                {editingUserId === u.id ? (
                  <input
                    type="text"
                    value={editName}
                    autoFocus
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(u.id)}
                    className="flex-1 rounded border border-indigo-500 bg-slate-900 px-2 py-0.5 text-xs text-slate-100 focus:outline-none"
                  />
                ) : (
                  <span className="text-sm font-medium text-slate-200 truncate">{u.name}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {editingUserId === u.id ? (
                  <button
                    onClick={() => handleSaveEdit(u.id)}
                    className="text-emerald-400 hover:text-emerald-300 p-1"
                    title="Save"
                  >
                    <Check size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(u)}
                    className="text-slate-400 hover:text-slate-200 p-1"
                    title="Rename"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(u)}
                  className="text-slate-400 hover:text-rose-400 p-1"
                  title="Remove member"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="New member name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shrink-0"
          >
            <UserPlus size={14} />
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
}