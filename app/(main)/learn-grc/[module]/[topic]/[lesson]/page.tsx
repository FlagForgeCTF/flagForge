"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getModuleBySlug, getLessonById, getTopicById } from "@/lib/grc-data";
import { GRCIcon } from "@/components/GRCIcon";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock,
  CheckCircle,
  BookOpen,
  Lightbulb,
  List,
  X,
} from "lucide-react";

// ─── Simple content renderer ────────────────────────────────────
function renderContent(raw: string) {
  // Split into paragraphs by double newline
  const blocks = raw.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Numbered list item: "1. **Title** — body" or "1. text"
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split(/\n(?=\d+\.\s)/);
      return (
        <ol key={i} className="list-none space-y-3 my-4">
          {items.map((item, j) => {
            const [numPart, ...rest] = item.replace(/^\d+\.\s/, "").split("");
            const text = item.replace(/^\d+\.\s+/, "");
            return (
              <li key={j} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-red-500/10 text-red-500 text-xs font-black flex items-center justify-center">
                  {j + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: inlineFormat(text) }}
                />
              </li>
            );
          })}
        </ol>
      );
    }

    // Bullet list: starts with "- "
    if (/^[-•]\s/.test(trimmed)) {
      const items = trimmed.split(/\n[-•]\s/);
      return (
        <ul key={i} className="list-none space-y-2 my-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3">
              <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
              <span
                className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: inlineFormat(item.replace(/^[-•]\s/, "")) }}
              />
            </li>
          ))}
        </ul>
      );
    }

    // Heading: starts with **text** alone on first line
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      return (
        <h3
          key={i}
          className="text-base font-black text-gray-900 dark:text-white mt-6 mb-2 tracking-tight"
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
        />
      );
    }

    // Normal paragraph
    return (
      <p
        key={i}
        className="text-gray-700 dark:text-gray-300 text-base leading-[1.8] mb-4"
        dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
      />
    );
  });
}

function inlineFormat(text: string): string {
  return text
    // Bold **text**
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
    // Italic *text*
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // Inline code `text`
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-mono text-sm">$1</code>');
}

// ─── Lesson sidebar mini navigator ──────────────────────────────
function LessonSidebar({
  mod,
  currentTopicId,
  currentLessonId,
  onClose,
}: {
  mod: ReturnType<typeof getModuleBySlug>;
  currentTopicId: string;
  currentLessonId: string;
  onClose: () => void;
}) {
  if (!mod) return null;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Contents</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {mod.topics.map((topic, ti) => (
          <div key={topic.id}>
            <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {ti + 1}. {topic.title}
            </div>
            {topic.lessons.map((lesson, li) => {
              const isActive = topic.id === currentTopicId && lesson.id === currentLessonId;
              return (
                <Link
                  key={lesson.id}
                  href={`/learn-grc/${mod.slug}/${topic.id}/${lesson.id}`}
                  onClick={onClose}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-red-500 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="text-[10px] font-black opacity-60">{ti + 1}.{li + 1}</span>
                  <span className="flex-1 leading-tight">{lesson.title}</span>
                  {isActive && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────
export default function GRCLessonPage() {
  const params = useParams();
  const moduleSlug = params.module as string;
  const topicId = params.topic as string;
  const lessonId = params.lesson as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mod = getModuleBySlug(moduleSlug);
  const topic = getTopicById(moduleSlug, topicId);
  const lesson = getLessonById(moduleSlug, topicId, lessonId);

  // Build flat lesson list for prev/next navigation
  const flatLessons: { moduleSlug: string; topicId: string; lessonId: string; lessonTitle: string }[] = [];
  if (mod) {
    for (const t of mod.topics) {
      for (const l of t.lessons) {
        flatLessons.push({ moduleSlug: mod.slug, topicId: t.id, lessonId: l.id, lessonTitle: l.title });
      }
    }
  }
  const currentIdx = flatLessons.findIndex((x) => x.topicId === topicId && x.lessonId === lessonId);
  const prevLesson = currentIdx > 0 ? flatLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null;

  if (!mod || !topic || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f4f1] dark:bg-[#0b0b0b]">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-4 mx-auto">
            <GRCIcon name="search" className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lesson Not Found</h1>
          <Link href="/learn-grc" className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors">
            Back to GRC Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4f1] dark:bg-[#0b0b0b] transition-colors duration-300">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center gap-3 py-6 border-b border-gray-100 dark:border-white/5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 flex-1 min-w-0 flex-wrap">
            <Link href="/learn-grc" className="hover:text-red-500 transition-colors font-semibold whitespace-nowrap">GRC Hub</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <Link href={`/learn-grc/${mod.slug}`} className="hover:text-red-500 transition-colors font-semibold truncate max-w-[140px]">{mod.title}</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300 font-bold truncate">{lesson.title}</span>
          </div>
          {/* Toggle sidebar button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-white/60 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-all flex-shrink-0 lg:hidden"
          >
            <List className="w-4 h-4" /> Contents
          </button>
        </div>

        <div className="flex gap-8 py-10">
          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl overflow-y-auto max-h-[calc(100vh-8rem)]">
              <LessonSidebar
                mod={mod}
                currentTopicId={topicId}
                currentLessonId={lessonId}
                onClose={() => {}}
              />
            </div>
          </aside>

          {/* ── Mobile sidebar ── */}
          <div
            className={`fixed top-0 right-0 h-full w-80 z-50 bg-white dark:bg-gray-950 border-l border-gray-100 dark:border-white/10 shadow-2xl transition-transform duration-300 lg:hidden ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <LessonSidebar
              mod={mod}
              currentTopicId={topicId}
              currentLessonId={lessonId}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {/* Lesson header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-100 dark:border-red-900/30">
                  <GRCIcon name={topic.icon} className="w-3 h-3" />
                  {topic.title}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 font-semibold">
                  <Clock className="w-3 h-3" /> {lesson.duration}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2 leading-tight">
                {lesson.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{mod.title}</span>
              </div>
            </div>

            {/* Content card */}
            <div className="bg-white/80 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl p-8 md:p-10 mb-8 shadow-lg">
              <div className="prose-like max-w-none">
                {renderContent(lesson.content)}
              </div>
            </div>

            {/* Key takeaways */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 md:p-8 mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-base font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Key Takeaways
                </h2>
              </div>
              <ul className="space-y-3">
                {lesson.keyTakeaways.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 pb-6">
              {prevLesson ? (
                <Link
                  href={`/learn-grc/${prevLesson.moduleSlug}/${prevLesson.topicId}/${prevLesson.lessonId}`}
                  className="group flex-1 flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 hover:border-red-500/20 hover:shadow-lg transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Previous</div>
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-red-500 transition-colors">
                      {prevLesson.lessonTitle}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {nextLesson ? (
                <Link
                  href={`/learn-grc/${nextLesson.moduleSlug}/${nextLesson.topicId}/${nextLesson.lessonId}`}
                  className="group flex-1 flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 hover:border-red-500/20 hover:shadow-lg transition-all justify-end text-right"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Next</div>
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-red-500 transition-colors">
                      {nextLesson.lessonTitle}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </Link>
              ) : (
                <Link
                  href={`/learn-grc/${mod.slug}`}
                  className="group flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-500/20"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Module Complete — Back to Menu</span>
                </Link>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
