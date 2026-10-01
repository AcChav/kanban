import React from 'react';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';

export default function SprintMetrics({ tasks = [] }) {
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length;
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;

  const percentage = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div className="flex items-center gap-5 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
      {/* Left: Progress Bar Section */}
      <div className="flex flex-col gap-1.5 w-44">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-300">Completion</span>
          <span className="font-semibold text-indigo-400">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-slate-800" />

      {/* Right: Side-by-Side Pill Stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <ListTodo size={14} className="text-amber-400" />
          <span className="text-slate-400">
            <strong className="text-slate-200">{todoCount}</strong> to do
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-blue-400" />
          <span className="text-slate-400">
            <strong className="text-slate-200">{inProgressCount}</strong> active
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="text-slate-400">
            <strong className="text-slate-200">{doneCount}</strong>/{total} done
          </span>
        </div>
      </div>
    </div>
  );
}