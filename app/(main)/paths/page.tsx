"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/components/loading";

interface PathSummary {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  total: number;
  completed: number;
}

const PathsPage = () => {
  const [paths, setPaths] = useState<PathSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/paths", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => (data.success ? setPaths(data.paths) : setError(data.message || "Failed to load paths")))
      .catch(() => setError("Failed to load paths"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Guided tracks of challenges. Solve each step to unlock the next.
          </p>
        </div>

        {error ? (
          <p className="py-20 text-center text-neutral-500">{error}</p>
        ) : paths.length === 0 ? (
          <p className="py-20 text-center text-neutral-500">No paths yet. Check back soon.</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {paths.map((path) => {
              const percent = path.total ? Math.round((path.completed / path.total) * 100) : 0;
              return (
                <li key={path._id}>
                  <Link
                    href={`/paths/${path.slug}`}
                    className="block h-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 hover:border-red-500 dark:hover:border-red-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold">{path.title}</h2>
                      <span className="shrink-0 rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                        {path.difficulty}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">{path.description}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                      <span>{path.completed}/{path.total} steps</span>
                      <span className="tabular-nums">{percent}%</span>
                    </div>
                    <div
                      className="mt-1.5 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${path.title} progress`}
                    >
                      <div className="h-full rounded-full bg-red-600" style={{ width: `${percent}%` }} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PathsPage;
