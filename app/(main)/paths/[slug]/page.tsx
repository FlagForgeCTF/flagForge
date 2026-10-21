"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Lock } from "lucide-react";
import Loading from "@/components/loading";

interface Step {
  _id: string;
  title: string;
  category: string;
  points: number;
  solved: boolean;
  locked: boolean;
}

interface PathDetail {
  title: string;
  description: string;
  difficulty: string;
  steps: Step[];
}

const PathPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [path, setPath] = useState<PathDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/paths/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => (data.success ? setPath(data.path) : setError(data.message || "Failed to load path")))
      .catch(() => setError("Failed to load path"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loading />;

  if (!path) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <p className="font-medium text-slate-900 dark:text-slate-100">{error}</p>
        <Link href="/paths" className="mt-6 inline-block text-sm text-red-600 hover:underline">
          All paths
        </Link>
      </div>
    );
  }

  const completed = path.steps.filter((s) => s.solved).length;
  const percent = path.steps.length ? Math.round((completed / path.steps.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href="/paths"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All paths
        </Link>

        <div className="mt-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{path.title}</h1>
            <span className="rounded-full bg-amber-100 dark:bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
              {path.difficulty}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-line text-slate-600 dark:text-slate-400">{path.description}</p>
          <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
            <div
              className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Path progress"
            >
              <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-400" style={{ width: `${percent}%` }} />
            </div>
            <span className="tabular-nums">{completed}/{path.steps.length}</span>
          </div>
        </div>

        <ol className="relative mt-6 before:absolute before:left-8 before:top-6 before:bottom-6 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
          {path.steps.map((step, index) => {
            const isNext = !step.solved && !step.locked;
            const body = (
              <>
                <span
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    step.solved
                      ? "bg-red-600 text-white"
                      : isNext
                        ? "bg-white dark:bg-slate-950 ring-2 ring-amber-400 text-amber-700 dark:text-amber-300"
                        : "bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500"
                  }`}
                >
                  {step.solved ? <Check className="h-4 w-4" aria-label="Solved" /> : step.locked ? <Lock className="h-3.5 w-3.5" aria-label="Locked" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{step.title}</span>
                  <span className="block text-xs text-slate-500">{step.category}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-slate-500">{step.points} pts</span>
              </>
            );
            return (
              <li key={step._id}>
                {step.locked ? (
                  <div
                    className="flex items-center gap-4 rounded-lg p-4 opacity-50"
                    title="Solve the previous step to unlock"
                  >
                    {body}
                  </div>
                ) : (
                  <Link
                    href={`/problems/${step._id}`}
                    className={`flex items-center gap-4 rounded-lg p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                      isNext ? "bg-amber-50 dark:bg-amber-400/5" : ""
                    }`}
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default PathPage;
