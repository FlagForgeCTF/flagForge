"use client";
import React from "react";

interface Player {
  name: string;
  totalScore: number;
  history?: { t: string; points: number }[];
}

// Categorical slots 1-5 of the dataviz reference palette, stepped per theme. Fixed order = rank order.
const SERIES = [
  "stroke-[#2a78d6] dark:stroke-[#3987e5] fill-[#2a78d6] dark:fill-[#3987e5] bg-[#2a78d6] dark:bg-[#3987e5]",
  "stroke-[#eb6834] dark:stroke-[#d95926] fill-[#eb6834] dark:fill-[#d95926] bg-[#eb6834] dark:bg-[#d95926]",
  "stroke-[#1baf7a] dark:stroke-[#199e70] fill-[#1baf7a] dark:fill-[#199e70] bg-[#1baf7a] dark:bg-[#199e70]",
  "stroke-[#eda100] dark:stroke-[#c98500] fill-[#eda100] dark:fill-[#c98500] bg-[#eda100] dark:bg-[#c98500]",
  "stroke-[#e87ba4] dark:stroke-[#d55181] fill-[#e87ba4] dark:fill-[#d55181] bg-[#e87ba4] dark:bg-[#d55181]",
];

const W = 800;
const H = 260;
const PAD = { top: 12, right: 16, bottom: 28, left: 48 };

const ScoreGraph = ({ players, now }: { players: Player[]; now: number }) => {
  // Cumulative score after each solve; the final point is the live total so hint/chat deductions show up.
  const series = players.slice(0, SERIES.length).map((player) => {
    let score = 0;
    const points = (player.history ?? []).map((solve) => {
      score += solve.points;
      return { t: new Date(solve.t).getTime(), score };
    });
    return { name: player.name, points, end: player.totalScore };
  });

  const allTimes = series.flatMap((s) => s.points.map((p) => p.t));
  if (allTimes.length === 0) return null;

  const t0 = Math.min(...allTimes);
  const maxScore = Math.max(1, ...series.flatMap((s) => [s.end, ...s.points.map((p) => p.score)]));
  const x = (t: number) => PAD.left + ((t - t0) / Math.max(1, now - t0)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - v / maxScore) * (H - PAD.top - PAD.bottom);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxScore * f));
  const fmtDate = (t: number) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <figure className="mt-10">
      <figcaption className="text-sm font-medium">Score over time · top {series.length}</figcaption>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
        {series.map((s, i) => (
          <li key={s.name} className="flex items-center gap-1.5">
            <span className={`inline-block h-0.5 w-4 rounded ${SERIES[i]}`} aria-hidden />
            {s.name}
          </li>
        ))}
      </ul>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full h-auto"
        role="img"
        aria-label={`Cumulative score over time for ${series.map((s) => s.name).join(", ")}`}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-neutral-500 text-[11px] tabular-nums">
              {v.toLocaleString()}
            </text>
          </g>
        ))}
        <text x={PAD.left} y={H - 8} className="fill-neutral-500 text-[11px]">{fmtDate(t0)}</text>
        <text x={W - PAD.right} y={H - 8} textAnchor="end" className="fill-neutral-500 text-[11px]">now</text>

        {series.map((s, i) => {
          // Step path: score holds flat until the next solve, then jumps.
          let d = `M ${x(t0)} ${y(0)}`;
          for (const p of s.points) d += ` H ${x(p.t)} V ${y(p.score)}`;
          d += ` H ${x(now)} V ${y(s.end)}`;
          return (
            <g key={s.name} className={SERIES[i]}>
              <path d={d} fill="none" strokeWidth={2} strokeLinejoin="round" />
              {s.points.map((p) => (
                <g key={p.t}>
                  <circle cx={x(p.t)} cy={y(p.score)} r={4} className="stroke-white dark:stroke-neutral-950" strokeWidth={2} />
                  {/* Larger invisible hit target carries the native tooltip */}
                  <circle cx={x(p.t)} cy={y(p.score)} r={10} fill="transparent" stroke="none">
                    <title>{`${s.name}: ${p.score.toLocaleString()} pts · ${new Date(p.t).toLocaleString()}`}</title>
                  </circle>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </figure>
  );
};

export default ScoreGraph;
