import React, { useState, useEffect } from "react";
import { X, AlignLeft } from "lucide-react";

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onTaskUpdated,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "MEDIUM");
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      const updated = await res.json();
      onTaskUpdated({
        ...task,
        title: updated.title,
        description: updated.description,
        priority: updated.priority || priority,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            {/* Priority Selector / Badge */}
            {isEditing ? (
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            ) : (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-semibold uppercase">
                {priority}
              </span>
            )}

            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {task.status.replace("_", " ")}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 flex-1">
          {/* Title Area */}
          <div>
            {isEditing ? (
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-semibold rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-100">{title}</h2>
            )}
          </div>

          {/* Description Area */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <AlignLeft size={14} />
              <span>Description</span>
            </div>

            {isEditing ? (
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add acceptance criteria, test cases, or full details..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-y font-normal leading-relaxed"
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="min-h-[140px] p-4 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed cursor-text"
              >
                {description || (
                  <span className="text-slate-500 italic">
                    No description provided. Click to add details...
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Assignee Information Strip */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Assignee:{" "}
              <strong className="text-slate-200 font-medium">
                {task.assignee_name || "Unassigned"}
              </strong>
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {isEditing
              ? "Make your edits and hit Save"
              : "Click the description or Edit button to update"}
          </span>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setTitle(task.title || "");
                    setDescription(task.description || "");
                    setPriority(task.priority || "MEDIUM");
                    setIsEditing(false);
                  }}
                  className="rounded-lg px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !title.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-750 transition-colors"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}