"use client";
import React, { useEffect, useState, useCallback } from "react";
import Loading from "@/components/loading";
import Image, { StaticImageData } from "next/image";
import Newbie from "../../../public/badges/0x1.png";
import Scout from "../../../public/badges/0x2.png";
import Codebreaker from "../../../public/badges/0x3.png";
import Hacker from "../../../public/badges/0x4.png";
import Cipher from "../../../public/badges/0x5.png";
import Forger from "../../../public/badges/0x6.png";
import Conqueror from "../../../public/badges/0x7.png";
import Flagforge from "../../../public/flagforge.gif";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ScoreGraph from "@/components/ScoreGraph";

interface LeaderboardUser {
  name: string;
  totalScore: number;
  rank: number;
  image: string;
  roomsCompleted: number;
  slug: string;
  history?: { t: string; points: number }[];
}

interface Level {
  max: number;
  code: string;
  name: string;
  badge: StaticImageData;
}

const LEVELS: Level[] = [
  { max: 200, code: "0x1", name: "Newbie", badge: Newbie },
  { max: 500, code: "0x2", name: "Scout", badge: Scout },
  { max: 1000, code: "0x3", name: "Codebreaker", badge: Codebreaker },
  { max: 1500, code: "0x4", name: "Hacker", badge: Hacker },
  { max: 2000, code: "0x5", name: "Cipher Hunter", badge: Cipher },
  { max: 3000, code: "0x6", name: "Forger", badge: Forger },
  { max: Infinity, code: "0x7", name: "Flag Conqueror", badge: Conqueror },
];

const getLevel = (score: number) => LEVELS.find((level) => score < level.max)!;

// Medal colours for the top three
const PODIUM_ACCENTS = [
  "border-t-amber-400",
  "border-t-neutral-400",
  "border-t-orange-400",
];

const formatAgo = (date: Date, now: number) => {
  const seconds = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
};

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [now, setNow] = useState(() => Date.now());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Handle image loading errors
  const handleImageError = useCallback((userName: string) => {
    setImageErrors((prev) => new Set([...prev, userName]));
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/leaderboard", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await res.json();

      const sortedData = data
        .sort(
          (a: { totalScore: number }, b: { totalScore: number }) =>
            b.totalScore - a.totalScore
        )
        .slice(0, 50) // Limit to top 50 users
        .map((user: any, index: number) => ({
          ...user,
          rank: index + 1,
        }));

      setLeaderboard(sortedData);
      setError("");
      setLastUpdated(new Date());
      // Clear image errors when data refreshes
      setImageErrors(new Set());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch leaderboard for all users (authenticated and unauthenticated)
    fetchLeaderboard();
    // Skip refreshes while the tab is in the background
    const intervalId = setInterval(() => {
      if (!document.hidden) fetchLeaderboard();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchLeaderboard]);

  // Keep the "updated ... ago" label ticking
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Fall back to the FlagForge logo when a user has no image or it fails to load
  const getImageSource = (user: LeaderboardUser) => {
    const hasValidImage =
      user.image && user.image.trim() !== "" && !imageErrors.has(user.name);
    return hasValidImage ? user.image : Flagforge.src;
  };

  const renderAvatar = (user: LeaderboardUser, sizeClass: string) => (
    <img
      src={getImageSource(user)}
      alt=""
      className={`${sizeClass} shrink-0 rounded-full object-cover bg-neutral-200 dark:bg-neutral-800`}
      onError={() => handleImageError(user.name)}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  );

  const renderBadge = (score: number, size: number) => {
    const level = getLevel(score);
    return (
      <Image
        src={level.badge}
        alt={level.name}
        title={level.name}
        width={size}
        height={size}
      />
    );
  };

  const profileHref = (user: LeaderboardUser) =>
    `/user/${encodeURIComponent(user.slug)}`;

  // Show loading only when data is being fetched, not when session is loading
  if (loading) {
    return <Loading />;
  }

  // Only replace the page with an error if there's nothing to show; a failed
  // background refresh keeps the last good data on screen
  if (error && leaderboard.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          Couldn&apos;t load the leaderboard.
        </p>
        <p className="mt-1 text-sm text-neutral-500">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="mt-6 rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Top 50 players · updated {formatAgo(lastUpdated, now)}
              {error && " · last refresh failed"}
            </p>
          </div>
          <Link
            href="/event-scoreboards"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Past event scoreboards
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <p className="py-20 text-center text-neutral-500">
            No one has scored yet. Be the first.
          </p>
        ) : (
          <>
            {/* Top three */}
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {podium.map((user, index) => {
                const level = getLevel(user.totalScore);
                return (
                  <li
                    key={`${user.name}-${user.rank}`}
                    className={`rounded-lg border border-neutral-200 dark:border-neutral-800 border-t-4 ${PODIUM_ACCENTS[index]} p-5`}
                  >
                    <div className="flex items-start justify-between">
                      {renderAvatar(user, "h-12 w-12")}
                      <span className="text-sm font-medium tabular-nums text-neutral-500">
                        #{user.rank}
                      </span>
                    </div>
                    <Link
                      href={profileHref(user)}
                      className="mt-4 block truncate font-semibold hover:underline underline-offset-4"
                    >
                      {user.name}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
                      {renderBadge(user.totalScore, 18)}
                      <span>{level.name}</span>
                    </div>
                    <div className="mt-4 flex gap-6 text-sm">
                      <div>
                        <div className="text-lg font-semibold tabular-nums">
                          {user.totalScore.toLocaleString()}
                        </div>
                        <div className="text-neutral-500">points</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold tabular-nums">
                          {user.roomsCompleted || 0}
                        </div>
                        <div className="text-neutral-500">rooms</div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <ScoreGraph players={leaderboard} now={now} />

            {/* Everyone else */}
            {rest.length > 0 && (
              <table className="mt-10 w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-left text-neutral-500">
                    <th scope="col" className="w-12 py-2 pr-2 font-medium">#</th>
                    <th scope="col" className="py-2 pr-2 font-medium">Player</th>
                    <th scope="col" className="hidden sm:table-cell py-2 pr-2 font-medium">Level</th>
                    <th scope="col" className="hidden sm:table-cell py-2 pr-2 text-right font-medium">Rooms</th>
                    <th scope="col" className="py-2 text-right font-medium">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {rest.map((user) => {
                    const level = getLevel(user.totalScore);
                    return (
                      <tr
                        key={`${user.name}-${user.rank}`}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
                      >
                        <td className="py-3 pr-2 tabular-nums text-neutral-500">
                          {user.rank}
                        </td>
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-3 min-w-0">
                            {renderAvatar(user, "h-7 w-7")}
                            <Link
                              href={profileHref(user)}
                              className="truncate font-medium hover:underline underline-offset-4"
                            >
                              {user.name}
                            </Link>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell py-3 pr-2">
                          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            {renderBadge(user.totalScore, 20)}
                            <span>{level.name}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell py-3 pr-2 text-right tabular-nums text-neutral-600 dark:text-neutral-400">
                          {user.roomsCompleted || 0}
                        </td>
                        <td className="py-3 text-right font-medium tabular-nums">
                          {user.totalScore.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
