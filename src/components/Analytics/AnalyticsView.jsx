import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useTaskContext } from '../../context/TaskContext.jsx';

const STATUS_COLORS = { Pending: '#8c1229', 'In Progress': '#d84a57', Done: '#4f8f57' };
const PRIORITY_COLORS = { High: '#a6203a', Medium: '#c4891b', Low: '#3f7a3a' };
const TOOLTIP_STYLE = { background: '#fbf8f3', border: '1px solid rgba(140,18,41,0.3)', borderRadius: 8, color: '#2a1216' };

const AnalyticsView = () => {
  const { tasks } = useTaskContext();

  const byCategory = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const cat = t.category || 'General';
      if (!map[cat]) map[cat] = { category: cat, estimated: 0, spent: 0, count: 0 };
      map[cat].estimated += t.estimatedMinutes || 0;
      map[cat].spent += t.spentMinutes || 0;
      map[cat].count += 1;
    });
    return Object.values(map);
  }, [tasks]);

  const byStatus = useMemo(() => {
    const counts = { Pending: 0, 'In Progress': 0, Done: 0 };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status] += 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const byPriority = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach((t) => {
      if (counts[t.priority] !== undefined) counts[t.priority] += 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        key: d.toDateString(),
        completed: 0
      });
    }
    tasks.forEach((t) => {
      if (!t.completedAt) return;
      const key = new Date(t.completedAt).toDateString();
      const day = days.find((d) => d.key === key);
      if (day) day.completed += 1;
    });
    return days;
  }, [tasks]);

  const totalMinutesSpent = tasks.reduce((sum, t) => sum + (t.spentMinutes || 0), 0);
  const hasData = tasks.length > 0;

  return (
    <div>
      <h1 className="page-heading">Analytics</h1>
      <p className="page-subtitle">A closer look at how work is actually going.</p>

      {!hasData ? (
        <p className="empty-copy">Add a few tasks to see analytics here.</p>
      ) : (
        <div className="analytics-grid">
          <div className="glass-panel chart-panel">
            <div className="panel-title">Completed — Last 7 Days</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,18,41,0.08)" />
                <XAxis dataKey="label" stroke="#8a7069" fontSize={12} />
                <YAxis stroke="#8a7069" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="completed" fill="#d84a57" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel chart-panel">
            <div className="panel-title">Tasks by Status</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {byStatus.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, color: '#2a1216' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel chart-panel">
            <div className="panel-title">Estimated vs Spent Minutes by Category</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,18,41,0.08)" />
                <XAxis dataKey="category" stroke="#8a7069" fontSize={12} />
                <YAxis stroke="#8a7069" fontSize={12} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="estimated" name="Estimated" fill="#8c1229" radius={[6, 6, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#d84a57" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel chart-panel">
            <div className="panel-title">Tasks by Priority</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byPriority} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,18,41,0.08)" />
                <XAxis type="number" stroke="#8a7069" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#8a7069" fontSize={12} width={70} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {byPriority.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {hasData && (
        <p className="analytics-footnote">
          Total time logged across all tasks: {Math.round(totalMinutesSpent / 60 * 10) / 10} hours
        </p>
      )}
    </div>
  );
};

export default AnalyticsView;
