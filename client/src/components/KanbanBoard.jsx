import React, { useState, useEffect } from 'react';
import Column from './Column.jsx';
import EditTaskModal from './EditTaskModal.jsx';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', dotColor: 'bg-amber-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', dotColor: 'bg-blue-400' },
  { id: 'REVIEW', title: 'In Review', dotColor: 'bg-purple-400' },
  { id: 'DONE', title: 'Done', dotColor: 'bg-emerald-400' }
];

export default function KanbanBoard({ sprintId = 1, users = [], onTasksChange }) {
  const [tasks, setTasks] = useState([]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/sprints/${sprintId}/tasks`);
      const data = await res.json();
      setTasks(data);
      if (onTasksChange) onTasksChange(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [sprintId]);

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const draggedTask = tasks.find((t) => t.id === draggedTaskId);
    if (!draggedTask || draggedTask.status === targetStatus) {
      setDraggedTaskId(null);
      return;
    }

    const targetColumnTasks = tasks.filter((t) => t.status === targetStatus);
    const newPosition = targetColumnTasks.length;

    const updatedTasks = tasks.map((t) =>
      t.id === draggedTaskId
        ? { ...t, status: targetStatus, position: newPosition }
        : t
    );
    setTasks(updatedTasks);
    if (onTasksChange) onTasksChange(updatedTasks);

    try {
      await fetch(`/api/tasks/${draggedTaskId}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, position: newPosition })
      });
    } catch (err) {
      console.error(err);
      fetchTasks();
    } finally {
      setDraggedTaskId(null);
    }
  };

  const handleAssignUser = async (taskId, userId) => {
    const selectedUser = users.find((u) => u.id === userId);
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            assigned_user_id: userId,
            assignee_name: selectedUser ? selectedUser.name : null,
            assignee_avatar: selectedUser ? selectedUser.avatar_url : null,
          }
        : task
    );
    setTasks(updatedTasks);
    if (onTasksChange) onTasksChange(updatedTasks);

    try {
      await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    const previous = [...tasks];
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    if (onTasksChange) onTasksChange(updated);

    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
      setTasks(previous);
      if (onTasksChange) onTasksChange(previous);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
    );
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        Loading sprint backlog...
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start gap-4 overflow-x-auto pb-4 h-[calc(100vh-140px)]">
        {COLUMNS.map((col) => {
          const columnTasks = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.position - b.position);

          return (
            <Column
              key={col.id}
              column={col}
              tasks={columnTasks}
              users={users}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onAssignUser={handleAssignUser}
              onDeleteTask={handleDeleteTask}
              onEditTask={(task) => setEditingTask(task)}
            />
          );
        })}
      </div>

      <EditTaskModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onTaskUpdated={handleTaskUpdated}
      />
    </>
  );
}