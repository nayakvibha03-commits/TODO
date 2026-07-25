import React from 'react';
import { useTaskContext } from '../../context/TaskContext.jsx';

const priorityClass = { High: 'pill-high', Medium: 'pill-medium', Low: 'pill-low' };

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const TaskCard = ({ task, compact = false, draggable = false, onDragStart, onDragOverCard, onDropCard }) => {
  const { openTaskModal, deleteTask, updateTask } = useTaskContext();
  const isOverdue = task.status !== 'Done' && new Date(task.dueDate) < new Date();

  const toggleDone = (e) => {
    e.stopPropagation();
    updateTask(task.id, { status: task.status === 'Done' ? 'Pending' : 'Done' });
  };

  return (
    <div
      className={`task-card glass-panel ${compact ? 'compact' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOverCard}
      onDrop={onDropCard}
      onClick={() => openTaskModal(task)}
    >
      <div className="task-card-top">
        <button className={`check-circle ${task.status === 'Done' ? 'checked' : ''}`} onClick={toggleDone} aria-label="Toggle complete" />
        <div className="task-card-body">
          <div className={`task-card-title ${task.status === 'Done' ? 'done' : ''}`}>
            {task.recurrence && task.recurrence !== 'None' && <span className="recur-icon" title={`Repeats ${task.recurrence}`}>↻</span>}
            {task.title}
          </div>
          {!compact && task.description && <p className="task-card-desc">{task.description}</p>}
          {!compact && task.tags && task.tags.length > 0 && (
            <div className="tag-chip-row small">
              {task.tags.map((tag) => (
                <span key={tag} className="tag-chip static">{tag}</span>
              ))}
            </div>
          )}
          <div className="task-card-meta">
            {task.status === 'Done' ? (
              <span className="status-badge-done">✓ Completed</span>
            ) : (
              <span className={`pill ${priorityClass[task.priority] || 'pill-medium'}`}>{task.priority}</span>
            )}
            <span className="task-card-category">{task.category}</span>
            <span className={`task-card-date ${isOverdue ? 'overdue' : ''}`}>
              {isOverdue ? '⚠ ' : ''}
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>
        {!compact && (
          <button
            className="task-delete"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            aria-label="Delete task"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
