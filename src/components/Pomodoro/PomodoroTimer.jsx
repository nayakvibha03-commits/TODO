import React, { useState, useEffect, useRef } from 'react';

const MODES = {
  focus: { label: 'Focus', minutes: 25 },
  short: { label: 'Short Break', minutes: 5 },
  long: { label: 'Long Break', minutes: 15 }
};

const PomodoroTimer = () => {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (mode === 'focus') setCyclesCompleted((c) => c + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const switchMode = (next) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode(next);
    setSecondsLeft(MODES[next].minutes * 60);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setSecondsLeft(MODES[mode].minutes * 60);
  };

  const total = MODES[mode].minutes * 60;
  const progress = 1 - secondsLeft / total;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const circumference = 2 * Math.PI * 90;

  return (
    <div>
      <h1 className="page-heading">Focus Timer</h1>
      <p className="page-subtitle">Work in short, uninterrupted bursts.</p>

      <div className="pomodoro-wrap glass-panel">
        <div className="pomodoro-modes">
          {Object.entries(MODES).map(([key, m]) => (
            <button
              key={key}
              className={`filter-tab ${mode === key ? 'active' : ''}`}
              onClick={() => switchMode(key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="pomodoro-ring-wrap">
          <svg viewBox="0 0 200 200" className="pomodoro-ring">
            <circle cx="100" cy="100" r="90" className="ring-track" strokeWidth="12" />
            <circle
              cx="100"
              cy="100"
              r="90"
              className="ring-fill pomodoro-fill"
              strokeWidth="12"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: circumference * (1 - progress)
              }}
            />
          </svg>
          <div className="pomodoro-time">
            {mins}:{secs}
          </div>
        </div>

        <div className="pomodoro-controls">
          <button className="btn btn-primary" onClick={() => setIsRunning((r) => !r)}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="btn btn-ghost" onClick={reset}>Reset</button>
        </div>

        <p className="pomodoro-cycles">Focus sessions completed today: {cyclesCompleted}</p>
      </div>
    </div>
  );
};

export default PomodoroTimer;
