import React from 'react';
import TaskCard from './TaskCard.jsx';

export default function Column({ 
  column, 
  tasks, 
  users, 
  onDragStart, 
  onDrop, 
  onDragOver, 
  onAssignUser,
  onDeleteTask,
  onEditTask
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
      className="flex flex-col w-80 min-w-[20rem] bg-slate-900/60 border border-slate-800 rounded-xl max-h-full overflow-hidden"
    >
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-300">
            {column.title}
          </h3>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 p-3 flex-1 overflow-y-auto min-h-[150px]">
        {tasks.map((task) => (
<TaskCard 
            key={task.id} 
            task={task} 
            users={users} 
            onDragStart={onDragStart} 
            onAssignUser={onAssignUser}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-24 border border-dashed border-slate-800/80 rounded-lg flex items-center justify-center text-xs text-slate-500">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}