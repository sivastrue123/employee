import React, { useMemo } from 'react';
import { differenceInHours, isWithinInterval, addDays, format } from 'date-fns';
import MetricCard from '../components/MetricCard';
import { useAppData } from '../context/DataContext';

const KPI_CONFIG = [
  { label: 'Open items', key: 'open', color: 'bg-slate-50' },
  { label: 'Due this week', key: 'week', color: 'bg-indigo-50' },
  { label: 'Weekly delivered', key: 'weekly', color: 'bg-emerald-50' },
  { label: 'Monthly delivered', key: 'monthly', color: 'bg-amber-50' },
];

const Dashboard: React.FC = () => {
  const { workItems, computeSlaSummary } = useAppData();

  const now = new Date();
  const nextWeek = addDays(now, 7);
  const lastWeek = addDays(now, -7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const slaCounts = useMemo(
    () =>
      workItems.reduce(
        (acc, item) => {
          acc[item.slaState === 'AtRisk' ? 'atrisk' : item.slaState === 'Breached' ? 'breached' : 'open']++;
          return acc;
        },
        { open: 0, atrisk: 0, breached: 0 },
      ),
    [workItems],
  );

  const dueThisWeek = useMemo(
    () =>
      workItems.filter((item) => {
        if (!item.dueDate || item.status === 'Delivered' || item.status === 'Closed') return false;
        const due = new Date(item.dueDate);
        return isWithinInterval(due, { start: now, end: nextWeek });
      }).length,
    [workItems, now, nextWeek],
  );

  const deliveredWeekly = useMemo(
    () =>
      workItems.filter((item) => {
        if (item.status !== 'Delivered' && item.status !== 'Closed') return false;
        if (!item.actualEnd) return false;
        const end = new Date(item.actualEnd);
        return end >= lastWeek;
      }).length,
    [workItems, lastWeek],
  );

  const deliveredMonthly = useMemo(
    () =>
      workItems.filter((item) => {
        if (item.status !== 'Delivered' && item.status !== 'Closed') return false;
        if (!item.actualEnd) return false;
        const end = new Date(item.actualEnd);
        return end >= startOfMonth;
      }).length,
    [workItems, startOfMonth],
  );

  const avgCycleByType = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {};
    workItems.forEach((item) => {
      if (item.actualStart && item.actualEnd) {
        const duration = differenceInHours(new Date(item.actualEnd), new Date(item.actualStart));
        if (!stats[item.workItemType]) {
          stats[item.workItemType] = { total: duration, count: 1 };
        } else {
          stats[item.workItemType].total += duration;
          stats[item.workItemType].count += 1;
        }
      }
    });
    return Object.entries(stats).map(([type, value]) => ({
      type,
      average: Math.round(value.total / value.count),
    }));
  }, [workItems]);

  const recentItems = useMemo(
    () =>
      workItems
        .filter((item) => item.status !== 'Closed')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 6),
    [workItems],
  );

  const kpis = useMemo(
    () => ({
      ...slaCounts,
      week: dueThisWeek,
      weekly: deliveredWeekly,
      monthly: deliveredMonthly,
    }),
    [slaCounts, dueThisWeek, deliveredWeekly, deliveredMonthly],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">WorkHub</p>
        <h1 className="text-3xl font-semibold text-slate-900">Delivery command center</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Track work items, SLA health, and delivery cadence from one command center. Use filters to drill into types,
          teams, or customers.
        </p>
        <div className="text-sm text-slate-500">
          Work items are managed on the command board—switch to Work Items to create or search across tickets.
        </div>
      </header>

      <section className="flex flex-wrap gap-4">
        {KPI_CONFIG.map((config) => (
          <MetricCard
            key={config.key}
            title={config.label}
            value={kpis[config.key as keyof typeof kpis] ?? 0}
            bgColorClass={config.color}
          />
        ))}
      </section>

      <section className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Active work items</h2>
            <p className="text-sm text-slate-500">Latest in-progress stories, requests, and releases</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-500 border-b">
                <th className="py-3 font-medium">ID</th>
                <th className="py-3 font-medium">Title</th>
                <th className="py-3 font-medium">Type</th>
                <th className="py-3 font-medium">Priority</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Due</th>
                <th className="py-3 font-medium">SLA</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.map((item) => {
                const slaSummary = computeSlaSummary(item);
                return (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 font-semibold text-slate-700">{item.id}</td>
                    <td className="py-3 text-slate-600">{item.title}</td>
                    <td className="py-3 uppercase text-xs font-semibold text-indigo-600">{item.workItemType}</td>
                    <td className="py-3 text-slate-600">{item.priority}</td>
                    <td className="py-3 text-slate-600">{item.status}</td>
                    <td className="py-3 text-slate-500">{item.dueDate ? format(new Date(item.dueDate), 'dd MMM') : 'TBD'}</td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          slaSummary.slaState === 'Breached'
                            ? 'bg-rose-100 text-rose-700'
                            : slaSummary.slaState === 'AtRisk'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {slaSummary.slaState}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Average cycle time</h3>
          <p className="text-sm text-slate-500">Calculated for completed items per type</p>
          <div className="space-y-2">
            {avgCycleByType.map((entry) => (
              <div key={entry.type} className="flex items-center justify-between text-sm text-slate-600">
                <span>{entry.type}</span>
                <span className="font-semibold text-slate-900">{entry.average}h</span>
            </div>
            ))}
            {avgCycleByType.length === 0 && <p className="text-sm text-slate-400">No completed cycle data yet.</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Timeline highlights</h3>
          <ul className="space-y-3 text-sm">
            {recentItems.slice(0, 3).map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-100 px-4 py-3 bg-slate-50">
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">
                  {item.workItemType} · Due {item.dueDate ? format(new Date(item.dueDate), 'dd MMM, yyyy') : 'TBD'}
                </p>
              </li>
            ))}
          </ul>
      </div>
      </section>

    </div>
  );
};

export default Dashboard;
