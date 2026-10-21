"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Loading from "@/components/loading";
import { useSession } from "next-auth/react";
import AuthError from "@/components/authError";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import doubt from "@/public/doubt.png";
import ConfettiBoom from "react-confetti-boom";
import FloatingChat from "@/components/FloatingChat";
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  Trophy,
} from "lucide-react";

// Fixed interface definitions
interface Hint {
  id?: number;
  index?: number;
  text: string;
  pointsDeduction: number | string;
}

interface Questions {
  _id?: string;
  title: string;
  flag: string;
  description: string;
  points: number | string;
  category: string;
  link: string;
  challengeFile?: string;
  challengeType?: 'link' | 'file';
  isTimeLimited: boolean;
  timeLimit: number | string;
  timeLimitUnit: "hours" | "days" | "weeks";
  expiryDate: string | Date | null;
  hints: Hint[];
  uploadedBy: string;
  createdAt?: string;
}

interface PageParams {
  id: string;
}

// Initial question with proper structure
const initialQuestion: Questions = {
  title: "",
  flag: "",
  description: "",
  points: "",
  category: "All",
  link: "",
  isTimeLimited: false,
  timeLimit: "",
  timeLimitUnit: "days",
  expiryDate: null,
  hints: [],
  uploadedBy: "",
};

const Page = ({ params }: { params: Promise<PageParams> }) => {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { data: session, status: sessionStatus } = useSession();
  const [problems, setProblems] = useState<Questions>(initialQuestion);
  const [flag, setFlag] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isIncorrect, setIsIncorrect] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [availableHints, setAvailableHints] = useState<Hint[]>([]);
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [usedHints, setUsedHints] = useState<number[]>([]);
  const [hintCount, setHintCount] = useState<number>(0);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [chatHintStats, setChatHintStats] = useState({
    totalPointsDeducted: 0,
    totalHintsUsed: 0,
  });
  const [solveCount, setSolveCount] = useState<number>(0);

  // Duplicate prevention refs
  const lastSubmissionTime = useRef<number>(0);
  const lastSubmittedFlag = useRef<string>("");
  const submissionInProgress = useRef<boolean>(false);
  const abortController = useRef<AbortController | null>(null);
  // Post-solve timers (confetti, redirect); cleared on unmount so leaving the
  // page doesn't yank the user back to /problems later
  const solveTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isPracticeMode = isDone && practiceMode;
  const MIN_SUBMISSION_INTERVAL = 1000;

  // URL validation function
  const isValidUrl = (string: string): boolean => {
    if (!string || string.trim() === "") return false;

    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Format time remaining
  const formatTimeRemaining = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Format expiry date
  const formatExpiryDate = (expiryDate: string | Date) => {
    const date = new Date(expiryDate);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/problems/${unwrappedParams.id}`);

      if (response.status === 410) {
        // HTTP Gone - expired
        const data = await response.json();
        setIsExpired(true);
        setMessage(data.message);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "This challenge doesn't exist or has been removed."
            : "Failed to load this challenge. Please try again."
        );
      }

      const data = await response.json();

      // Handle the data structure properly
      setIsDone(data.isDone);
      setIsCorrect(data.isDone);
      setUsedHints(data.usedHints || []);
      setHintCount(typeof data.hintCount === "number" ? data.hintCount : 0);
      setSolveCount(data.solveCount || 0);

      // Ensure we have proper hints array
      const questionData = data.question || {};
      const hints = Array.isArray(questionData.hints) ? questionData.hints : [];

      setProblems({
        ...initialQuestion,
        ...questionData,
        hints: hints,
      });

      // Calculate time remaining
      let calculatedTimeRemaining = data.timeRemaining;
      if (!calculatedTimeRemaining && questionData.expiryDate) {
        const expiryTime = new Date(questionData.expiryDate).getTime();
        const currentTime = Date.now();
        calculatedTimeRemaining = Math.max(0, expiryTime - currentTime);
      }

      setTimeRemaining(calculatedTimeRemaining);
      setIsExpired(
        data.expired ||
        (calculatedTimeRemaining !== null && calculatedTimeRemaining <= 0)
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching problem:", error);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load this challenge."
      );
      setLoading(false);
    }
  };

  // Fetch hints from backend
  const fetchHints = async () => {
    if (hintLoading || availableHints.length > 0) return;

    try {
      setHintLoading(true);
      const response = await fetch(`/api/problems/${unwrappedParams.id}/hints`);

      if (!response.ok) {
        throw new Error("Failed to fetch hints");
      }

      const data = await response.json();
      setAvailableHints(data.hints || []);
      setUsedHints(data.usedHints || []);
      setHintCount(Array.isArray(data.hints) ? data.hints.length : 0);
    } catch (error) {
      console.error("Error fetching hints:", error);
      setMessage("Failed to load hints. Please try again.");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setHintLoading(false);
    }
  };

  // Request a specific hint
  const requestHint = async (hintIndex: number) => {
    // Check authentication before allowing hint request
    if (sessionStatus === "unauthenticated") {
      router.push("/authentication");
      return;
    }

    if (usedHints.includes(hintIndex)) return;

    try {
      setHintLoading(true);
      const response = await fetch(
        `/api/problems/${unwrappedParams.id}/hints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hintIndex }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to request hint");
      }

      const data = await response.json();
      setUsedHints((prev) => [...prev, hintIndex]);
      setMessage(data.message);

      // Update user's total score if points were deducted
      if (data.pointsDeducted > 0) {
        setTimeout(() => setMessage(null), 5000);
      } else {
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error requesting hint:", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to request hint"
      );
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setHintLoading(false);
    }
  };

  // Toggle hints display and fetch if needed
  const toggleHints = async () => {
    if (!showHint) {
      await fetchHints();
    }
    setShowHint(!showHint);
  };

  // Callback for chat hint usage
  const handleChatPointsDeducted = (points: number, total: number) => {
    setChatHintStats((prev) => ({
      totalPointsDeducted: total,
      totalHintsUsed: prev.totalHintsUsed + 1,
    }));

    // Show a notification
    setMessage(`Chat hint used! ${points} points deducted.`);
    setTimeout(() => setMessage(null), 3000);
  };

  // Update time remaining every second for time-limited challenges
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0 && !isExpired && !isDone) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev > 1000) {
            return prev - 1000;
          } else {
            setIsExpired(true);
            setMessage("This challenge has expired");
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeRemaining, isExpired, isDone]);

  const canSubmit = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime.current;
    const flagTrimmed = flag.trim();

    if (isCorrect && !isPracticeMode) {
      return { allowed: false, reason: "You have already solved this problem" };
    }
    if (isExpired) {
      return { allowed: false, reason: "This challenge has expired" };
    }
    if (submitting || submissionInProgress.current) {
      return { allowed: false, reason: "Submission in progress..." };
    }
    if (!flagTrimmed) {
      return { allowed: false, reason: "Please enter a flag" };
    }
    if (lastSubmittedFlag.current === flagTrimmed) {
      return { allowed: false, reason: "This flag was already submitted" };
    }
    if (timeSinceLastSubmission < MIN_SUBMISSION_INTERVAL) {
      return { allowed: false, reason: "Please wait before submitting again" };
    }

    return { allowed: true };
  }, [
    flag,
    submitting,
    isCorrect,
    isPracticeMode,
    isExpired,
    MIN_SUBMISSION_INTERVAL
  ]);

  const handleSubmit = async () => {
    // Check authentication before allowing flag submission
    if (sessionStatus === "unauthenticated") {
      router.push("/authentication");
      return;
    }

    const submissionCheck = canSubmit();
    if (!submissionCheck.allowed) {
      if (submissionCheck.reason) {
        setMessage(submissionCheck.reason);
        setTimeout(() => setMessage(null), 3000);
      }
      return;
    }

    if (abortController.current) {
      abortController.current.abort();
    }

    try {
      setSubmitting(true);
      submissionInProgress.current = true;
      const now = Date.now();
      const flagTrimmed = flag.trim();

      lastSubmissionTime.current = now;
      lastSubmittedFlag.current = flagTrimmed;

      abortController.current = new AbortController();
      setMessage(null);

      const requestUrl = isPracticeMode
        ? `/api/problems/${unwrappedParams.id}?practice=true`
        : `/api/problems/${unwrappedParams.id}`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flag: flagTrimmed }),
        signal: abortController.current.signal,
      });

      if (abortController.current.signal.aborted) {
        return;
      }

      const result = await response.json();

      if (response.ok) {
        const isRight =
          typeof result.correct === "boolean"
            ? result.correct
            : result.message?.includes("Right");
        setMessage(result.message);
        if (isRight) {
          setIsIncorrect(false);
          if (!isPracticeMode) {
            setIsCorrect(true);
            setShowConfetti(true);
            setFlag("");
            solveTimers.current.push(
              setTimeout(() => setShowConfetti(false), 3000),
              setTimeout(() => setIsDone(true), 5000),
              setTimeout(() => router.push("/problems"), 8000)
            );
          } else {
            setFlag("");
            lastSubmittedFlag.current = "";
          }
        } else {
          setIsIncorrect(true);
          setTimeout(
            () => (lastSubmittedFlag.current = ""),
            MIN_SUBMISSION_INTERVAL
          );
        }
      } else {
        setMessage(result.message || "An error occurred");
        setIsIncorrect(true);
        setTimeout(
          () => (lastSubmittedFlag.current = ""),
          MIN_SUBMISSION_INTERVAL
        );
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error(error);
      setMessage("An error occurred. Please try again.");
      setTimeout(
        () => (lastSubmittedFlag.current = ""),
        MIN_SUBMISSION_INTERVAL
      );
    } finally {
      setSubmitting(false);
      submissionInProgress.current = false;
      abortController.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlag(e.target.value);
    if (isIncorrect) {
      setIsIncorrect(false);
    }
  };

  const enterPracticeMode = () => {
    setPracticeMode(true);
    setFlag("");
    setIsIncorrect(false);
    lastSubmittedFlag.current = "";
    lastSubmissionTime.current = 0;
  };

  const exitPracticeMode = () => {
    setPracticeMode(false);
    setFlag("");
    setIsIncorrect(false);
    lastSubmittedFlag.current = "";
    lastSubmissionTime.current = 0;
  };

  useEffect(() => {
    return () => {
      if (abortController.current) abortController.current.abort();
      solveTimers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    fetchProblems();
  }, []);

  const messageTone = useMemo(() => {
    if (!message) return "";

    if (message.includes("Right") || message.includes("Correct")) {
      return "border-green-200 bg-green-50 text-green-800 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-200";
    }

    if (
      message.includes("points deducted") ||
      message.includes("Hint revealed") ||
      message.includes("Chat hint used")
    ) {
      return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800/60 dark:bg-orange-900/20 dark:text-orange-200";
    }

    return "border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-200";
  }, [message]);

  const isSubmissionLocked =
    submitting || isExpired || (!isPracticeMode && isCorrect);

  if (loading || sessionStatus === "loading") return <Loading />;

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gray-950 text-black dark:text-white">
        <div className="max-w-md w-full text-center rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-900/10 p-8">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
            Challenge unavailable
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{loadError}</p>
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-5 py-2.5 text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to problems
          </Link>
        </div>
      </div>
    );
  }

  // Allow viewing the problem without authentication
  // Authentication will be required only when submitting flags

  // Show expired challenge page
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-red-50/40 to-white dark:from-gray-950 dark:via-gray-900/40 dark:to-gray-950 text-black dark:text-white transition-colors duration-300 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-red-200/40 blur-3xl dark:bg-red-500/10" />
        <div className="pointer-events-none absolute -bottom-24 left-[-10%] h-72 w-72 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-500/10" />
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-12 relative z-10">
          <div className="flex flex-col gap-10 justify-center items-center text-center">
            <div className="w-full max-w-2xl rounded-2xl border border-red-200/70 dark:border-red-800/50 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.7)]">
              <h1 className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
                Challenge Expired
              </h1>
              <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
                <p className="text-lg text-red-800 dark:text-red-200 mb-2">
                  This time-limited challenge has expired and is no longer
                  available.
                </p>
                {problems.expiryDate && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Expired on: {formatExpiryDate(problems.expiryDate)}
                  </p>
                )}
              </div>
            </div>
            <Image
              src={doubt}
              alt="Challenge expired"
              className="w-72 drop-shadow-xl"
            />
            <p className="w-full mx-auto text-center text-lg text-gray-800 dark:text-gray-300 transition-colors duration-300 max-w-2xl">
              Don't worry! Check out other available{" "}
              <Link
                href="/problems"
                className="text-rose-500 dark:text-red-400 hover:underline transition-colors duration-300"
              >
                challenges
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-red-50/40 to-white dark:from-gray-950 dark:via-gray-900/40 dark:to-gray-950 text-black dark:text-white transition-colors duration-300 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-[-8%] h-72 w-72 rounded-full bg-red-200/40 blur-3xl dark:bg-red-500/10" />
      <div className="pointer-events-none absolute -bottom-24 left-[-8%] h-72 w-72 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-500/10" />
      {message && (
        <div className="fixed top-6 right-4 sm:right-6 z-50">
          <div
            role="status"
            aria-live="polite"
            className={`max-w-[320px] rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 ${messageTone}`}
          >
            <p className="text-sm font-semibold">{message}</p>
          </div>
        </div>
      )}
      {isCorrect && !isDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-green-200/80 dark:border-green-800/60 bg-white/95 dark:bg-gray-950/90 p-6 sm:p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-green-500 text-white shadow-lg">
              <Trophy className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white text-center">
              Congratulations!
            </h2>
            <p className="mt-3 text-center text-gray-600 dark:text-gray-300">
              {message || "Flag accepted. Great work!"}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/problems"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-green-700 transition-colors"
              >
                Back to problems
              </Link>
            </div>
          </div>
        </div>
      )}
      {!isDone && (
        <div className="fixed bottom-6 right-6 z-40">
          <FloatingChat
            userId={session?.user?.id || ""}
            challengeId={unwrappedParams.id}
            onPointsDeducted={handleChatPointsDeducted}
          />
        </div>
      )}
      {isDone && !isPracticeMode ? (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-12 relative z-10">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-emerald-200/70 dark:border-emerald-800/50 bg-gradient-to-br from-white/95 via-emerald-50/60 to-sky-50/60 dark:from-gray-950/90 dark:via-emerald-950/30 dark:to-gray-950/80 p-8 sm:p-12 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.8)]">
            <div className="pointer-events-none absolute -top-24 right-[-10%] h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10" />
            <div className="pointer-events-none absolute -bottom-24 left-[-10%] h-64 w-64 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:items-start">
              <div className="flex flex-col gap-6 lg:pr-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                    <Trophy className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-900/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-200">
                    Challenge Completed
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {problems.title}
                  </h1>
                  <p className="mt-3 text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-xl">
                    You already solved this challenge. Pick a new one and keep
                    the momentum going.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-emerald-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Points Earned
                    </p>
                    <p className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {problems.points}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Category
                    </p>
                    <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                      {problems.category}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Hints Used
                    </p>
                    <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                      {usedHints.length}
                    </p>
                  </div>
                </div>
                {problems.expiryDate && (
                  <div className="rounded-2xl border border-yellow-200/70 dark:border-yellow-800/60 bg-yellow-50/80 dark:bg-yellow-900/20 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-yellow-700 dark:text-yellow-200">
                      Time Limited
                    </p>
                    <p className="mt-2 text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                      Expired on: {formatExpiryDate(problems.expiryDate)}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={enterPracticeMode}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-5 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200 hover:bg-white/90 dark:hover:bg-gray-900 transition-colors"
                  >
                    Redo challenge
                  </button>
                  <Link
                    href="/problems"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    Back to problems
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-white/90 dark:hover:bg-gray-900 transition-colors"
                  >
                    View leaderboard
                  </Link>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Redo opens practice mode. Your score stays locked.
                </p>
              </div>
              <div className="relative lg:mt-1">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-emerald-200/30 blur-3xl dark:bg-emerald-500/10" />
                <div className="relative rounded-[2rem] border border-emerald-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/70 p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.7)]">
                  <Image
                    src={doubt}
                    alt="Challenge completed"
                    className="w-full max-w-sm mx-auto drop-shadow-xl"
                  />
                  <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
                    Ready for another challenge? Explore the problem list and
                    push your score higher.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-10 relative z-10">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-red-100/70 dark:border-white/10 bg-gradient-to-br from-white/95 via-red-50/80 to-orange-50/70 dark:from-gray-950/90 dark:via-gray-900/80 dark:to-gray-950/80 p-6 sm:p-10 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.8)]">
            <div className="pointer-events-none absolute -top-24 right-[-10%] h-56 w-56 rounded-full bg-red-400/30 blur-3xl dark:bg-red-500/10" />
            <div className="pointer-events-none absolute -bottom-24 left-[-10%] h-56 w-56 rounded-full bg-orange-300/30 blur-3xl dark:bg-orange-500/10" />
            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/problems"
                  className="inline-flex items-center gap-2 rounded-full border border-red-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white/90 dark:hover:bg-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to problems
                </Link>
                <div className="flex items-center gap-3 rounded-full border border-red-200/60 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 px-4 py-2 shadow-sm">
                  <span className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Points</span>
                  <span className="text-lg font-bold text-red-500">{problems.points}</span>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-red-200/60 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 px-4 py-2 shadow-sm">
                  <span className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Solves</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{solveCount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {problems.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-500/90 text-white px-4 py-1 text-xs font-semibold uppercase tracking-wide">
                      {problems.category}
                    </span>
                    {problems.expiryDate && (
                      <span className="rounded-full border border-yellow-200/70 dark:border-yellow-800/60 bg-yellow-50/80 dark:bg-yellow-900/30 px-3 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-200">
                        Time-limited
                      </span>
                    )}
                    {isCorrect && (
                      <span className="rounded-full border border-green-200/70 dark:border-green-800/60 bg-green-50/80 dark:bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-200">
                        Solved
                      </span>
                    )}
                    {isPracticeMode && (
                      <span className="rounded-full border border-emerald-200/70 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                        Practice mode
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {timeRemaining && timeRemaining > 0 && !isExpired && (
                    <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-4 py-3 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Time Remaining
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {formatTimeRemaining(timeRemaining)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isPracticeMode && (
            <div className="mt-6 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-900/20 p-4 sm:p-5 shadow-sm backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                    Practice mode is on
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Submissions are checked, but your score will not change.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exitPracticeMode}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-200 hover:bg-white/90 dark:hover:bg-gray-900 transition-colors"
                >
                  Exit practice
                </button>
              </div>
            </div>
          )}

          {(problems.expiryDate || chatHintStats.totalHintsUsed > 0) && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {problems.expiryDate && (
                <div className="rounded-2xl bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/70 dark:border-yellow-800/60 p-4 sm:p-5 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Time-Limited Challenge
                    </p>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Expires on: {formatExpiryDate(problems.expiryDate)}
                  </p>
                </div>
              )}

              {chatHintStats.totalHintsUsed > 0 && (
                <div className="rounded-2xl bg-orange-50/80 dark:bg-orange-900/20 border border-orange-200/70 dark:border-orange-800/60 p-4 sm:p-5 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-orange-600 dark:text-orange-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                          Chat Assistant Usage
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                          {chatHintStats.totalHintsUsed} chat hint{chatHintStats.totalHintsUsed !== 1 ? "s" : ""} requested
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        -{chatHintStats.totalPointsDeducted}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">points deducted</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl p-6 shadow-lg transition-colors duration-300">
                <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  Description
                </p>
                <p className="text-gray-800 dark:text-gray-300 transition-colors duration-300 mt-3">
                  {problems.description}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl p-6 shadow-lg transition-colors duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    Given Resources
                  </p>
                  {problems.challengeType === 'file' && problems.challengeFile ? (
                    <a
                      href={problems.challengeFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-purple-500/90 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-purple-600 transition-colors"
                      aria-label={`Download Challenge File: ${problems.challengeFile.split('/').pop()}`}
                    >
                      Download File
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : problems.link ? (
                    isValidUrl(problems.link) ? (
                      <a
                        href={problems.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-red-500/90 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-red-600 transition-colors"
                        aria-label={`Start Challenge: ${problems.link}`}
                      >
                        Start Challenge
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <div
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100/80 dark:bg-gray-900/60 px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400"
                        title={problems.link}
                      >
                        Resource Available
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No resources provided
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200/70 dark:border-rose-800/50 bg-rose-50/70 dark:bg-rose-900/15 backdrop-blur-xl p-6 shadow-lg transition-colors duration-300">
                <button
                  type="button"
                  onClick={toggleHints}
                  disabled={hintLoading}
                  aria-expanded={showHint}
                  aria-controls="hints-panel"
                  className={`w-full flex items-center justify-between gap-4 rounded-2xl px-2 py-1 text-left transition-colors duration-300 ${hintLoading ? "cursor-not-allowed opacity-80" : "hover:bg-white/50 dark:hover:bg-white/5"}`}
                >
                  <span className="flex items-center gap-2 text-lg font-semibold text-rose-800 dark:text-rose-200">
                    <Lightbulb
                      className="h-5 w-5 text-rose-600 dark:text-rose-300"
                      aria-hidden="true"
                    />
                    <span>Available Hints</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span
                      className={`text-sm sm:text-md px-4 py-2 shadow-sm text-center bg-red-500/90 dark:bg-red-500 rounded-full text-white font-bold transition-colors duration-300 ${hintLoading ? "animate-pulse" : ""}`}
                    >
                      {hintLoading ? "Loading..." : hintCount}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-rose-600 dark:text-rose-300 transition-transform duration-300 ${showHint ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {/* Hints section */}
                {showHint && (
                  <div
                    id="hints-panel"
                    className="mt-4 bg-white/70 dark:bg-gray-900/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4"
                    aria-busy={hintLoading}
                  >
                    {availableHints.length > 0 ? (
                      <div className="space-y-3">
                        {availableHints.map((hint: Hint, index: number) => {
                          const hintIdx =
                            hint.index !== undefined ? hint.index : index;
                          const isUsed = usedHints.includes(hintIdx);
                          const displayHintIndex =
                            hintIdx >= 0 ? hintIdx + 1 : index + 1;
                          const hintKey = hintIdx >= 0 ? hintIdx : index;
                          return (
                            <div
                              key={hintKey}
                              className="bg-white/90 dark:bg-gray-800 border border-rose-200 dark:border-rose-700 rounded-2xl p-4 shadow-sm"
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-rose-800 dark:text-rose-200">
                                      Hint {displayHintIndex}
                                    </span>
                                    {Number(hint.pointsDeduction) > 0 && (
                                        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-medium">
                                          -{hint.pointsDeduction} pts
                                        </div>
                                      )}
                                  </div>
                                  {isUsed ? (
                                    <p className="text-rose-700 dark:text-rose-300">
                                      {hint.text}
                                    </p>
                                  ) : (
                                    <p className="text-gray-600 dark:text-gray-400 italic">
                                      {isPracticeMode
                                        ? "Hints are locked in practice mode."
                                        : 'Click "Use Hint" to reveal this hint'}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  {!isUsed && !isPracticeMode && (
                                    <button
                                      onClick={() => requestHint(hintIdx)}
                                      disabled={hintLoading}
                                      className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {hintLoading ? "..." : "Use Hint"}
                                    </button>
                                  )}
                                  {!isUsed && isPracticeMode && (
                                    <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
                                      Locked
                                    </span>
                                  )}
                                  {isUsed && (
                                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                      Used
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-rose-700 dark:text-rose-300">
                        {hintLoading
                          ? "Loading hints..."
                          : "No hints available for this challenge."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div
                className={`border rounded-2xl p-6 flex flex-col justify-start gap-4 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg transition-colors duration-300 ${isCorrect
                  ? "border-green-200/80 dark:border-green-800/60 bg-green-50/40 dark:bg-green-900/10"
                  : "border-gray-200/70 dark:border-white/10"
                  }`}
                aria-busy={submitting}
              >
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Submit Flag</p>
                <input
                  type="text"
                  className={`py-2.5 px-4 block w-full border rounded-full text-base sm:text-lg bg-white/90 dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-400 transition-colors duration-300 shadow-sm ${isSubmissionLocked
                    ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/60"
                    : isIncorrect
                      ? "border-red-500 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-700"
                    }`}
                  placeholder="Flag here!"
                  aria-label="Flag"
                  value={flag}
                  onChange={handleFlagChange}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmissionLocked}
                  maxLength={100}
                />
                <button
                  className={`w-full sm:w-[180px] border rounded-full px-4 py-2 text-white shadow-sm transition-colors duration-300 ${isSubmissionLocked
                    ? "bg-gray-400 border-gray-400 cursor-not-allowed"
                    : sessionStatus === "unauthenticated"
                      ? "bg-blue-500/90 dark:bg-blue-500 border-blue-500/70 dark:border-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700"
                      : "bg-red-500/90 dark:bg-red-500 border-red-500/70 dark:border-red-600 hover:bg-red-700 dark:hover:bg-red-700"
                    } ${submitting ? "animate-pulse" : ""}`}
                  onClick={handleSubmit}
                  disabled={isSubmissionLocked}
                >
                  {submitting
                    ? "Submitting..."
                    : isExpired
                      ? "Expired"
                      : isCorrect && !isPracticeMode
                        ? "Solved!"
                        : sessionStatus === "unauthenticated"
                          ? "Login to Submit"
                          : isPracticeMode
                            ? "Submit (Practice)"
                            : "Submit"}
                </button>

                {/* Time remaining display */}
                {timeRemaining && timeRemaining > 0 && !isExpired && (
                  <div className="text-center">
                    <div
                      className={`inline-block px-4 py-2 rounded-full font-semibold shadow-sm ${timeRemaining < 3600000 // Less than 1 hour
                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                        : timeRemaining < 86400000 // Less than 1 day
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800"
                          : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                        }`}
                    >
                      Time Remaining: {formatTimeRemaining(timeRemaining)}
                    </div>
                  </div>
                )}

                {showConfetti && (
                  <ConfettiBoom
                    colors={[
                      "#FF6347",
                      "#FFD700",
                      "#00FF00",
                      "#1E90FF",
                      "#FF69B4",
                    ]}
                    particleCount={100}
                    shapeSize={30}
                    deg={270}
                    effectCount={Infinity}
                    effectInterval={3000}
                    spreadDeg={60}
                    x={0.5}
                    y={0.5}
                    launchSpeed={1}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default Page;
