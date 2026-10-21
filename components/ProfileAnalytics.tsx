"use client";
import React from "react";

export interface SolveStats {
  categories: { category: string; count: number; points: number }[];
  activity: { date: string; count: number }[];
  currentStreak: number;
  longestStreak: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
// Sequential single-hue ramp (brand red), empty days stay neutral.
const LEVELS = [
  "bg-gray-100 dark:bg-white/5",
  "bg-red-200 dark:bg-red-950",
  "bg-red-400 dark:bg-red-800",
  "bg-red-600 dark:bg-red-600",
  "bg-red-800 dark:bg-red-400",
];
const level = (count: number) => (count === 0 ? 0 : Math.min(count, LEVELS.length - 1));

const ProfileAnalytics = ({ stats }: { stats?: SolveStats }) => {
  if (!stats) return null;

  // 53 week-columns ending today (UTC, matching the API), Sunday-first like most activity calendars.
  const counts = new Map(stats.activity.map((a) => [a.date, a.count]));
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const start = today - (52 * 7 + new Date(today).getUTCDay()) * DAY_MS;
  const days: { date: string; count: number }[] = [];
  for (let t = start; t <= today; t += DAY_MS) {
    const date = new Date(t).toISOString().slice(0, 10);
    days.push({ date, count: counts.get(date) ?? 0 });
  }
  const yearTotal = stats.activity.reduce((n, a) => n + a.count, 0);
  const maxCategory = Math.max(1, ...stats.categories.map((c) => c.count));

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">Activity</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {yearTotal} solves in the last year · streak{" "}
            <span className="font-bold text-gray-900 dark:text-white">{stats.currentStreak}d</span> · best{" "}
            <span className="font-bold text-gray-900 dark:text-white">{stats.longestStreak}d</span>
          </p>
        </div>
        <div className="mt-6 overflow-x-auto">
          <div
            className="grid grid-rows-[repeat(7,11px)] grid-flow-col gap-[3px] w-max"
            role="img"
            aria-label={`${yearTotal} solves in the last year, current streak ${stats.currentStreak} days, longest ${stats.longestStreak} days`}
          >
            {days.map((d) => (
              <div
                key={d.date}
                className={`h-[11px] w-[11px] rounded-[2px] ${LEVELS[level(d.count)]}`}
                title={`${d.count} solve${d.count === 1 ? "" : "s"} on ${d.date}`}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-gray-500" aria-hidden>
          Less
          {LEVELS.map((cls) => (
            <span key={cls} className={`h-[11px] w-[11px] rounded-[2px] ${cls}`} />
          ))}
          More
        </div>
      </div>

      <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">By category</h3>
        {stats.categories.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">No solves yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {stats.categories.map((c) => (
              <li key={c.category} title={`${c.points.toLocaleString()} pts`}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white truncate">{c.category}</span>
                  <span className="tabular-nums text-gray-500 dark:text-gray-400">{c.count}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/5">
                  <div className="h-full rounded-full bg-red-600" style={{ width: `${(c.count / maxCategory) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfileAnalytics;
