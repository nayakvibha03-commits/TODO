import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Hold on the title, then fade the whole splash out, then hand off to the app.
    const exitTimer = setTimeout(() => setExiting(true), 1800);
    const doneTimer = setTimeout(() => onFinish(), 2500);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-root ${exiting ? 'stage-exit' : ''}`}>
      <div className="splash-title-wrap">
        <h1 className="splash-title">NexusTask</h1>
        <div className="splash-underline" />
        <div className="splash-tag">P R O</div>
      </div>
    </div>
  );
};

export default SplashScreen;
