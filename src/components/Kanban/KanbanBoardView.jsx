import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext.jsx';
import TaskCard from '../Tasks/TaskCard.jsx';

const COLUMNS = ['Pending', 'In Progress', 'Done'];

const KanbanBoardView = () => {
  const { tasks, reorderTask } = useTaskContext();
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleColumnDrop = (status) => (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/task-id');
    if (id) reorderTask(id, null, status);
    setDragOverCol(null);
  };

  const handleCardDrop = (targetTask) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData('text/task-id');
    if (id && id !== targetTask.id) reorderTask(id, targetTask.id, targetTask.status);
    setDragOverCol(null);
  };

  return (
    <div>
      <h1 className="page-heading">Board</h1>
      <p className="page-subtitle">Drag cards across columns as work moves.</p>

      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <div
            key={col}
            className={`kanban-column glass-panel ${dragOverCol === col ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(col);
            }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={handleColumnDrop(col)}
          >
            <div className="kanban-column-header">
              {col}
              <span className="filter-count">{tasks.filter((t) => t.status === col).length}</span>
            </div>
            <div className="kanban-column-body">
              {tasks
                .filter((t) => t.status === col)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/task-id', task.id)}
                    onDragOverCard={(e) => e.preventDefault()}
                    onDropCard={handleCardDrop(task)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoardView;
