"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import AuthError from "@/components/authError";
import Image from "next/image";
import Newbie from "../../../public/badges/0x1.png";
import Scout from "../../../public/badges/0x2.png";
import Codebreaker from "../../../public/badges/0x3.png";
import Hacker from "../../../public/badges/0x4.png";
import Cipher from "../../../public/badges/0x5.png";
import Forger from "../../../public/badges/0x6.png";
import Conqueror from "../../../public/badges/0x7.png";
import Flagforge from "../../../public/flagforge.gif";
import { ChevronDown, Trophy } from "lucide-react";
import Link from "next/link";

interface LeaderboardUser {
  name: string;
  totalScore: number;
  rank: number;
  image: string;
  roomsCompleted: number;
  slug: string;
}

const LeaderboardPage = () => {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  // Handle image loading errors
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>, userName: string) => {
      setImageErrors((prev) => new Set([...prev, userName]));
    },
    []
  );

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
    const intervalId = setInterval(fetchLeaderboard, 10000);

    return () => clearInterval(intervalId);
  }, [fetchLeaderboard]);

  const getLevel = useCallback((score: number): string => {
    if (score < 200) return "[0x1][NEWBIE]";
    if (score < 500) return "[0x2][SCOUT]";
    if (score < 1000) return "[0x3][CODEBREAKER]";
    if (score < 1500) return "[0x4][HACKER]";
    if (score < 2000) return "[0x5][CIPHER HUNTER]";
    if (score < 3000) return "[0x6][FORGER]";
    return "[0x7][FLAG CONQUEROR]";
  }, []);

  const getBadgeComponent = useCallback(
    (score: number, size: "small" | "medium" | "large" = "medium") => {
      const dimensions = {
        small: { width: 32, height: 32 },
        medium: { width: 40, height: 40 },
        large: { width: 48, height: 48 },
      };

      const { width, height } = dimensions[size];

      if (score < 200)
        return (
          <Image
            src={Newbie}
            alt="Newbie"
            width={width}
            height={height}
            className="drop-shadow-md"
          />
        );
      if (score < 500)
        return (
          <Image
            src={Scout}
            alt="Scout"
            width={width}
            height={height}
            className="drop-shadow-md"
          />
        );
      if (score < 1000)
        return (
          <Image
            src={Codebreaker}
            alt="Codebreaker"
            width={width}
            height={height}
            className="drop-shadow-md"
          />
        );
      if (score < 1500)
        return (
          <Image
            src={Hacker}
            alt="Hacker"
            width={width}
            height={height}
            className="drop-shadow-md"
          />
        );
      if (score < 2000)
        return (
          <Image
            src={Cipher}
            alt="Cipher Hunter"
            width={width}
            height={height}
            className="drop-shadow-md"
          />
        );
      if (score < 3000)
        return (
          <Image
            src={Forger}
            alt="Forger"
            width={width}
            height={height}
            className="drop-shadow-md"
          />
        );
      return (
        <Image
          src={Conqueror}
          alt="Flag Conqueror"
          width={width}
          height={height}
          className="drop-shadow-md"
        />
      );
    },
    []
  );

  // Check if user has a valid image - if not, should show Flagforge
  const hasValidImage = (user: LeaderboardUser) => {
    return (
      user.image && user.image.trim() !== "" && !imageErrors.has(user.name)
    );
  };

  // Get the appropriate image source - either user image or Flagforge fallback
  const getImageSource = (user: LeaderboardUser) => {
    return hasValidImage(user) ? user.image : Flagforge.src;
  };

  const toggleExpanded = (rank: number) => {
    setExpandedUser((prev) => (prev === rank ? null : rank));
  };

  // Show loading only when data is being fetched, not when session is loading
  if (loading) {
    return <Loading />;
  }

  // Note: Removed authentication check to allow public browsing

  // Only replace the page with an error if there's nothing to show; a failed
  // background refresh keeps the last good data on screen
  if (error && leaderboard.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center mt-[20vh] dark:bg-gray-900 min-h-screen px-4 transition-colors duration-300">
        <h1 className="text-xl sm:text-2xl text-center text-red-500 dark:text-red-500 font-bold mb-4 transition-colors duration-300">
          Error: {error}
        </h1>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-red-500 dark:bg-red-500 text-white rounded hover:bg-red-600 dark:hover:bg-red-600 transition-colors duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-red-50/40 to-white dark:from-gray-950 dark:via-gray-900/40 dark:to-gray-950 py-10 px-4 sm:px-6 lg:px-10 transition-colors duration-300 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-[-12%] h-72 w-72 rounded-full bg-red-200/40 blur-3xl dark:bg-red-500/10" />
      <div className="pointer-events-none absolute -bottom-24 left-[-12%] h-72 w-72 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-500/10" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
        <div className="w-full rounded-3xl border border-red-100/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl px-6 py-6 sm:px-10 sm:py-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.6)] text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight text-red-500 dark:text-red-400 font-extrabold transition-colors duration-300">
            Leaderboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 transition-colors duration-300">
            Showing top 50 players only
          </p>
          
          {/* Event Scoreboards Link */}
          <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Link
              href="/event-scoreboards"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-300"
            >
              <Trophy className="h-4 w-4" />
              View Past Event Scoreboards
            </Link>
          </div>
        </div>

        <div className="w-full">
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No data available
            </p>
          ) : (
            <>
              {/* First Place - Compact */}
              {leaderboard.length > 0 && (
                <div className="mb-6">
                  <div className="relative overflow-hidden rounded-3xl border border-yellow-200/70 dark:border-yellow-500/20 bg-white/90 dark:bg-gray-900/70 px-4 py-5 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.6)] ring-1 ring-yellow-300/70 transition-colors duration-300">
                    <div className="pointer-events-none absolute -top-10 right-[-15%] h-32 w-32 rounded-full bg-yellow-300/30 blur-2xl" />
                    <span className="text-lg font-bold absolute top-2 right-3 text-yellow-500">
                      #{leaderboard[0].rank}
                    </span>

                    {/* Golden corner decoration for 1st place */}
                    <div className="absolute right-0 bottom-0 w-16 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 [clip-path:polygon(100%_0,0_100%,100%_100%)]">
                      <div className="absolute right-1 bottom-1 text-white text-xs font-bold">
                        1st
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-yellow-200 dark:border-yellow-600 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 transition-colors duration-300 shadow-md">
                        <img
                          src={getImageSource(leaderboard[0])}
                          alt={`${leaderboard[0].name}'s avatar`}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            handleImageError(e, leaderboard[0].name)
                          }
                          loading="lazy"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1">
                        <button
                          onClick={() =>
                            router.push(`/user/${leaderboard[0].slug}`)
                          }
                          className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        >
                          {leaderboard[0].name}
                        </button>
                        <span className="font-semibold text-red-500 dark:text-red-400 text-sm">
                          {getLevel(leaderboard[0].totalScore)}
                        </span>
                        <div className="flex items-center flex-wrap gap-3 mt-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          <p className="text-sm">
                            Points:{" "}
                            <span className="font-bold">
                              {leaderboard[0].totalScore.toLocaleString()}
                            </span>
                          </p>
                          <p className="text-sm">
                            Rooms:{" "}
                            <span className="font-bold">
                              {leaderboard[0].roomsCompleted || 0}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Level Badge for 1st place */}
                      <div className="flex-shrink-0">
                        {getBadgeComponent(leaderboard[0].totalScore, "medium")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2nd to 5th Place - Compact Grid */}
              {leaderboard.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {leaderboard
                    .slice(1, 5)
                    .map((user: LeaderboardUser, index: number) => {
                      const actualIndex = index + 1; // Since we're starting from index 1
                      return (
                        <div
                          key={`${user.name}-${user.rank}-${user.totalScore}`}
                          className="transition-all duration-300 hover:-translate-y-1"
                        >
                          <div
                            className={`flex flex-col rounded-2xl px-3 py-3 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] relative overflow-clip border border-gray-200/70 dark:border-white/10 bg-white/90 dark:bg-gray-900/60 transition-colors duration-300 ${actualIndex === 1 ? "ring-2 ring-gray-400" : ""
                              } ${actualIndex === 2 ? "ring-2 ring-orange-400" : ""
                              }`}
                          >
                            <span
                              className={`text-lg font-bold absolute top-2 right-3 ${actualIndex === 1
                                ? "text-gray-500"
                                : actualIndex === 2
                                  ? "text-orange-500"
                                  : "text-red-500 dark:text-red-400"
                                }`}
                            >
                              #{user.rank}
                            </span>

                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-full mb-2 border-2 border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto transition-colors duration-300">
                              <img
                                src={getImageSource(user)}
                                alt={`${user.name}'s avatar`}
                                className="w-full h-full object-cover"
                                onError={(e) => handleImageError(e, user.name)}
                                loading="lazy"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Badge */}
                            <div className="flex justify-center mb-2">
                              {getBadgeComponent(user.totalScore, "small")}
                            </div>

                            <span className="font-medium text-xs text-red-500 dark:text-red-500 text-center">
                              {getLevel(user.totalScore)}
                            </span>
                            <button
                              onClick={() =>
                                router.push(
                                  `/user/${encodeURIComponent(user.slug)}`
                                )
                              }
                              className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate text-center transition-colors duration-300 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                            >
                              {user.name}
                            </button>
                            <p className="text-xs text-gray-600 dark:text-gray-300 text-center transition-colors duration-300">
                              Points: {user.totalScore.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 text-center transition-colors duration-300">
                              Rooms: {user.roomsCompleted || 0}
                            </p>

                            {actualIndex === 1 && (
                              <div className="absolute right-0 bottom-0 w-12 h-10 bg-gradient-to-br from-gray-400 to-gray-600 [clip-path:polygon(100%_0,0_100%,100%_100%)]">
                                <div className="absolute right-1 bottom-1 text-white text-xs font-bold">
                                  2nd
                                </div>
                              </div>
                            )}
                            {actualIndex === 2 && (
                              <div className="absolute right-0 bottom-0 w-12 h-10 bg-gradient-to-br from-orange-400 to-orange-600 [clip-path:polygon(100%_0,0_100%,100%_100%)]">
                                <div className="absolute right-1 bottom-1 text-white text-xs font-bold">
                                  3rd
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Table for remaining users - Compact */}
              {leaderboard.length > 5 && (
                <>
                  {/* Mobile Accordion */}
                  <div className="space-y-3 md:hidden">
                    {leaderboard.slice(5).map((user: LeaderboardUser) => {
                      const isOpen = expandedUser === user.rank;
                      return (
                        <div
                          key={`${user.name}-${user.rank}-${user.totalScore}`}
                          className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/90 dark:bg-gray-900/60 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.6)] transition-colors duration-300 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleExpanded(user.rank)}
                            aria-expanded={isOpen}
                            aria-controls={`leaderboard-row-${user.rank}`}
                            className="w-full flex items-center justify-between px-4 py-4 text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                #{user.rank}
                              </div>
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                                <img
                                  src={getImageSource(user)}
                                  alt={`${user.name}'s avatar`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => handleImageError(e, user.name)}
                                  loading="lazy"
                                  crossOrigin="anonymous"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-red-500 dark:text-red-400 truncate">
                                  {user.name}
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                  {getLevel(user.totalScore)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {user.totalScore.toLocaleString()}
                              </div>
                              <ChevronDown
                                className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                  }`}
                              />
                            </div>
                          </button>
                          <div
                            id={`leaderboard-row-${user.rank}`}
                            className={`px-4 pb-4 transition-all duration-300 ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                              } overflow-hidden`}
                          >
                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300">
                              <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 px-3 py-2">
                                <div className="uppercase tracking-widest text-[10px] text-gray-400">
                                  Points
                                </div>
                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {user.totalScore.toLocaleString()}
                                </div>
                              </div>
                              <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 px-3 py-2">
                                <div className="uppercase tracking-widest text-[10px] text-gray-400">
                                  Rooms
                                </div>
                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {user.roomsCompleted || 0}
                                </div>
                              </div>
                              <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 px-3 py-2">
                                <div className="uppercase tracking-widest text-[10px] text-gray-400">
                                  Badge
                                </div>
                                <div className="mt-1">
                                  {getBadgeComponent(user.totalScore, "small")}
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  router.push(
                                    `/user/${encodeURIComponent(user.name)}`
                                  )
                                }
                                className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-2 text-sm font-semibold hover:bg-red-500/20 transition-colors"
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block rounded-2xl overflow-hidden border border-gray-200/70 dark:border-white/10 bg-white/90 dark:bg-gray-900/60 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.6)] transition-colors duration-300">
                    <div className="grid grid-cols-5 gap-3 p-3 bg-gradient-to-r from-red-500 to-red-600 text-xs font-semibold uppercase tracking-widest text-white border-b border-red-600 transition-colors duration-300">
                      <div>Rank</div>
                      <div>Username</div>
                      <div>Points</div>
                      <div>Rooms</div>
                      <div>Badge</div>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {leaderboard
                        .slice(5)
                        .map((user: LeaderboardUser) => (
                          <div
                            key={`${user.name}-${user.rank}-${user.totalScore}`}
                            className="grid grid-cols-5 gap-3 p-4 text-sm hover:bg-red-50/60 dark:hover:bg-white/5 transition-colors duration-300"
                          >
                            <div className="text-gray-800 dark:text-gray-200 font-medium">
                              {user.rank}
                            </div>

                            {/* Username with Avatar */}
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                                <img
                                  src={getImageSource(user)}
                                  alt={`${user.name}'s avatar`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => handleImageError(e, user.name)}
                                  loading="lazy"
                                  crossOrigin="anonymous"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/user/${encodeURIComponent(user.slug)}`
                                    )
                                  }
                                  className="text-red-500 dark:text-red-500 font-medium truncate hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                                >
                                  {user.name}
                                </button>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {getLevel(user.totalScore)}
                                </div>
                              </div>
                            </div>

                            <div className="text-gray-800 dark:text-gray-200">
                              {user.totalScore.toLocaleString()}
                            </div>

                            <div className="text-gray-800 dark:text-gray-200">
                              {user.roomsCompleted || 0}
                            </div>

                            <div className="flex items-center">
                              {getBadgeComponent(user.totalScore, "small")}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
