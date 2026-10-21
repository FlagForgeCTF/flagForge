"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowDown, ArrowUp, Edit2, Plus, Trash2, X } from "lucide-react";
import Loading from "@/components/loading";

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Insane"];
const EMPTY_FORM = { title: "", description: "", difficulty: "Easy", challenges: [] as string[] };

interface PathSummary {
  _id: string;
  title: string;
  slug: string;
  difficulty: string;
  total: number;
}

export default function ManagePaths() {
  const router = useRouter();
  const { status } = useSession();
  const [paths, setPaths] = useState<PathSummary[]>([]);
  const [challenges, setChallenges] = useState<{ _id: string; title: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  // Slug of the path being edited; null while creating
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPaths = async () => {
    const res = await fetch("/api/paths", { cache: "no-store" });
    const data = await res.json();
    if (data.success) setPaths(data.paths);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/roles/developers/admins/auth");
    } else if (status === "authenticated") {
      Promise.all([
        fetchPaths(),
        fetch("/api/admin/problems?limit=1000")
          .then((res) => res.json())
          .then((data) => data.success && setChallenges(data.data)),
      ])
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingSlug(null);
    setError("");
    setFormOpen(true);
  };

  const openEdit = async (slug: string) => {
    const res = await fetch(`/api/paths/${encodeURIComponent(slug)}`, { cache: "no-store" });
    const data = await res.json();
    if (!data.success) return alert(data.message || "Failed to load path");
    const { title, description, difficulty, challenges: ids } = data.path;
    // Drop ids of challenges that were deleted since the path was saved
    const existing = new Set(challenges.map((c) => c._id));
    setForm({ title, description, difficulty, challenges: ids.map(String).filter((id: string) => existing.has(id)) });
    setEditingSlug(slug);
    setError("");
    setFormOpen(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this path? Challenges and solves are not affected.")) return;
    const res = await fetch(`/api/paths/${encodeURIComponent(slug)}`, { method: "DELETE" });
    if (res.ok) setPaths((prev) => prev.filter((p) => p.slug !== slug));
    else alert("Failed to delete path");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(editingSlug ? `/api/paths/${encodeURIComponent(editingSlug)}` : "/api/paths", {
        method: editingSlug ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to save path");
      setFormOpen(false);
      fetchPaths();
    } catch (err) {
      console.error(err);
      setError("Failed to save path");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveStep = (index: number, delta: number) => {
    const next = [...form.challenges];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setForm({ ...form, challenges: next });
  };

  const titleOf = (id: string) => challenges.find((c) => c._id === id)?.title ?? id;
  const available = challenges.filter((c) => !form.challenges.includes(c._id));
  const inputClass =
    "w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none";

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Learning Paths</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Group challenges into ordered tracks.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> New Path
            </button>
            <button
              onClick={() => router.push("/roles/developers/admins")}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Title</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Difficulty</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Steps</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paths.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No paths yet.</td>
                </tr>
              )}
              {paths.map((p) => (
                <tr key={p._id} className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-4 text-slate-900 dark:text-slate-100">{p.title}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{p.difficulty}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{p.total}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEdit(p.slug)}
                      aria-label={`Edit ${p.title}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.slug)}
                      aria-label={`Delete ${p.title}`}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingSlug ? "Edit Path" : "New Path"}</h2>
              <button type="button" onClick={() => setFormOpen(false)} aria-label="Close" className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</span>
              <input required maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
              <textarea required maxLength={2000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</span>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={inputClass}>
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Steps (in order)</span>
              <ol className="space-y-1">
                {form.challenges.map((id, i) => (
                  <li key={id} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
                    <span className="w-6 text-slate-500 tabular-nums">{i + 1}.</span>
                    <span className="flex-1 truncate text-slate-900 dark:text-slate-100">{titleOf(id)}</span>
                    <button type="button" disabled={i === 0} onClick={() => moveStep(i, -1)} aria-label="Move up" className="p-1 text-slate-500 disabled:opacity-30">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button type="button" disabled={i === form.challenges.length - 1} onClick={() => moveStep(i, 1)} aria-label="Move down" className="p-1 text-slate-500 disabled:opacity-30">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setForm({ ...form, challenges: form.challenges.filter((c) => c !== id) })} aria-label="Remove step" className="p-1 text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ol>
              <select
                value=""
                onChange={(e) => e.target.value && setForm({ ...form, challenges: [...form.challenges, e.target.value] })}
                className={inputClass}
                aria-label="Add a challenge"
              >
                <option value="">+ Add a challenge…</option>
                {available.map((c) => (
                  <option key={c._id} value={c._id}>{c.title} ({c.category})</option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || form.challenges.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                {isSubmitting ? "Saving…" : "Save Path"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
