import React from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';

const ToastStack = () => {
  const { toasts } = useTaskContext();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastStack;
