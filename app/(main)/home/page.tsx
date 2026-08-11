"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import AuthError from "@/components/authError";
import OnboardingGuide from "@/components/OnboardingGuide";
import Image from "next/image";
import FlagForge from "../../../public/flagforge.gif";
import Link from "next/link";
import {
  Flag,
  LayoutDashboard,
  Trophy,
  Target,
  Users,
  Clock,
  CheckCircle,
  PlayCircle,
  TrendingUp,
  Shield,
  Zap,
  Star,
  Archive,
} from "lucide-react";
import ArchivesSection from "@/components/ArchivesSection";
import ScoreboardSection from "@/components/ScoreboardSection";
import InstagramFeed from "@/components/InstagramFeed";


interface UserStats {
  totalScore: number;
  rank: number;
  level: string;
  completedQuestions: number;
  badges: number;
  streak: number;
}

interface LatestRoom {
  _id: string;
  title: string;
  category: string;
  points: number;
  description: string;
  createdAt: string;
  difficulty?: string;
}

interface SolvedRoom {
  _id: string;
  title: string;
  category: string;
  points: number;
  solvedAt: string;
}

const Home = () => {
  const { status: sessionStatus, data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [latestRoom, setLatestRoom] = useState<LatestRoom | null>(null);
  const [lastSolved, setLastSolved] = useState<SolvedRoom | null>(null);

  // Redirect unauthenticated users to landing page
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchUserStats();
      fetchLatestRoom();
      fetchLastSolved();
    }
  }, [sessionStatus]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const fetchLatestRoom = async () => {
    try {
      const response = await fetch("/api/problems?limit=400");

      if (response.ok) {
        const data = await response.json();

        let rooms = [];

        if (Array.isArray(data)) {
          rooms = data;
        } else if (data.data && Array.isArray(data.data)) {
          rooms = data.data;
        } else if (data.problems && Array.isArray(data.problems)) {
          rooms = data.problems;
        } else if (data.questions && Array.isArray(data.questions)) {
          rooms = data.questions;
        }


        if (rooms.length > 0) {
          setLatestRoom(rooms[0]);
        } else {
          console.log("No rooms found in response");
        }
      } else {
        console.error(
          "API response not ok:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Failed to fetch latest room:", error);
    }
  };

  const fetchLastSolved = async () => {
    try {
      const response = await fetch("/api/user/recent-solved");

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setLastSolved(data[0]);
        } else if (
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setLastSolved(data.data[0]);
        } else {
          console.log("No solved problems found or empty response");
        }
      } else {
        console.error(
          "Recent solved API response not ok:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Failed to fetch last solved:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Web: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-500",
      Crypto:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400",
      Forensics:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
      "Reverse Engineering":
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
      PWN: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400",
      OSINT: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400",
      Misc: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400",
    };
    return (
      colors[category as keyof typeof colors] ||
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400"
    );
  };

  const getDifficultyColor = (points: number) => {
    if (points <= 100) return "text-green-600 dark:text-green-400";
    if (points <= 300) return "text-yellow-600 dark:text-yellow-400";
    if (points <= 500) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-500";
  };

  // Redirect unauthenticated users to landing page
  if (sessionStatus === "loading" || loading) {
    return <Loading />;
  }

  // This will be handled by the useEffect redirect above
  if (sessionStatus === "unauthenticated") {
    return <Loading />;
  }

  // Show onboarding guide for new users with no completed challenges
  if (userStats && userStats.completedQuestions === 0) {
    return <OnboardingGuide />;
  }

  return (
    <div
      className={`min-h-screen bg-[#f8f4f1] dark:bg-[#0b0b0b] transition-colors duration-300 relative overflow-hidden`}
    >
      <div className="pointer-events-none absolute -top-48 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.2),rgba(248,113,113,0))] blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.18),rgba(251,146,60,0))] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.18),rgba(244,63,94,0))] blur-3xl" />

      <div className="relative z-10">
        <div className="relative overflow-x-hidden overflow-y-visible transition-colors duration-300">
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(239,68,68,0.15) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }}
            ></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-bounce">
            <div className="w-3 h-3 bg-red-200 dark:bg-red-500 rounded-full"></div>
          </div>
          <div className="absolute top-32 right-20 animate-pulse">
            <div className="w-2 h-2 bg-red-300 dark:bg-red-500 rounded-full"></div>
          </div>
          <div className="absolute bottom-20 left-1/4 animate-bounce delay-300">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-600 rounded-full"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <div className="relative overflow-hidden rounded-[2.75rem] border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl shadow-[0_40px_90px_-35px_rgba(15,23,42,0.45)] p-6 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.14),rgba(2,6,23,0))]" />
              <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                    <div className="relative">
                      <Image
                        src={FlagForge}
                        height={100}
                        width={100}
                        alt="flagforge"
                        className="rounded-lg shadow-2xl"
                      />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tight drop-shadow-sm transition-colors duration-300 flex items-center justify-center lg:justify-start">
                      Flag
                      <span className="text-red-500 dark:text-red-500">Forge</span>
                      <span className="text-xs ml-3 font-black text-red-500 border border-red-500/30 px-2 py-0.5 rounded-md bg-red-500/5 uppercase tracking-wider">
                        MIT
                      </span>
                    </h1>
                  </div>
                  <p
                    className={` text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed mb-6 transition-colors duration-300`}
                  >
                    Master cybersecurity through hands-on CTF challenges at Model Institute of Technology (MIT College)
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Star className="h-5 w-5 text-red-500 dark:text-red-500 fill-red-500 dark:fill-red-500" />
                    <span className="text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
                      Join 500+ Active Security Professionals
                    </span>
                    <Star className="h-5 w-5 text-red-500 dark:text-red-500 fill-red-500 dark:fill-red-500" />
                  </div>
                  <div className="flex justify-center lg:justify-start pt-10 text-center lg:text-left">
                    {/* Enhanced User Level Display - only for authenticated users */}
                    {userStats && sessionStatus === "authenticated" && (
                      <div>
                        <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-white/60 dark:border-white/10 shadow-xl transition-colors duration-300">
                          <div className="relative">
                            <Shield className="h-8 w-8 text-red-500 dark:text-red-500" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 dark:bg-red-500 rounded-full animate-pulse"></div>
                          </div>
                          <div className="text-left">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                              {userStats.level}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                              Security Level
                            </div>
                          </div>
                          <div className="flex gap-1 ml-4">
                            {Array.from({
                              length: Math.min(userStats.badges, 5),
                            }).map((_, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              ></div>
                            ))}
                            {userStats.badges > 5 && (
                              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium ml-2 transition-colors duration-300">
                                +{userStats.badges - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {userStats && sessionStatus === "authenticated" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group relative bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-600 mb-3">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">
                        {userStats.totalScore.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
                        Total Points
                      </div>
                    </div>

                    <div className="group relative bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-600 mb-3">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-bold text-red-500 dark:text-red-500 mb-1 transition-colors duration-300">
                        #{userStats.rank}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
                        Rank
                      </div>
                    </div>

                    <div className="group relative bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-600 mb-3">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">
                        {userStats.completedQuestions}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
                        Challenges Solved
                      </div>
                    </div>

                    <div className="group relative bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-600 mb-3">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-bold text-red-500 dark:text-red-500 mb-1 transition-colors duration-300">
                        {userStats.streak}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
                        Day Streak
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Welcome Message for New Users */}
          {userStats?.completedQuestions === 0 && (
            <div className="mt-8">
              <div className="max-w-7xl mx-auto px-6">
                <div className="bg-white/80 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-[2rem] p-8 text-center transition-colors duration-300 shadow-xl">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-100/80 dark:bg-red-800/40 rounded-full transition-colors duration-300">
                      <Shield className="h-8 w-8 text-red-500 dark:text-red-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">
                    Welcome to the Forge!
                  </h2>
                  <p className={` text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300`}>
                    Ready to test your cybersecurity skills? Practice with realistic
                    scenarios and showcase your abilities in our gamified
                    environment.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 dark:bg-red-500 rounded-full"></div>
                      Web
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                      Crypto
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                      Forensics
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                      Reverse
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
                      PWN
                    </div>
                  </div>
                  <button className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-2xl transition-colors duration-300 shadow-lg shadow-red-500/20">
                    Start Your First Challenge
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Platform Stats */}
          <div className="mt-8">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl p-4 text-center transition-colors duration-300 shadow-lg">
                  <div className="text-2xl font-bold text-red-500 dark:text-red-500 mb-1 transition-colors duration-300">
                    100+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Active Users
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl p-4 text-center transition-colors duration-300 shadow-lg">
                  <div className="text-2xl font-bold text-red-500 dark:text-red-500 mb-1 transition-colors duration-300">
                    50+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Challenges
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl p-4 text-center transition-colors duration-300 shadow-lg">
                  <div className="text-2xl font-bold text-red-500 dark:text-red-500 mb-1 transition-colors duration-300">
                    250+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Flags Captured
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Latest Challenge */}
            <div className="bg-white/80 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-[2rem] p-6 transition-colors duration-300 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-red-500 dark:text-red-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  Latest Challenge
                </h2>
              </div>
              {latestRoom ? (
                <Link
                  href={`/problems/${latestRoom._id}`}
                  className="group block bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-red-500 dark:group-hover:text-red-500 transition-colors">
                        {latestRoom.title}
                      </h3>
                      <p className={` text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300`}>
                        {latestRoom.description.substring(0, 100)}...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 transition-colors duration-300">
                        Created:{" "}
                        {new Date(latestRoom.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div
                        className={`text-lg font-bold ${getDifficultyColor(
                          latestRoom.points
                        )}`}
                      >
                        {latestRoom.points} pts
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                        latestRoom.category
                      )}`}
                    >
                      {latestRoom.category}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No challenges available</p>
                </div>
              )}

              <div className="mt-4 text-center">
                <Link
                  href="/problems"
                  className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-medium px-6 py-2 rounded-2xl transition-colors duration-300 shadow-lg shadow-red-500/20"
                >
                  View All Challenges
                </Link>
              </div>
            </div>

            {/* Last Solved & Quick Actions */}
            <div className="space-y-6">
              {/* Last Solved Problem */}
              <div className="bg-white/80 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-[2rem] p-6 transition-colors duration-300 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    Last Solved
                  </h2>
                </div>

                {lastSolved ? (
                  <div className="bg-green-50/80 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded transition-colors duration-300">
                        <Flag className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                          {lastSolved.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          {lastSolved.category} • {lastSolved.points} pts
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
                        {new Date(lastSolved.solvedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No challenges solved yet</p>
                    <p className="text-xs">Complete your first challenge!</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-[2rem] p-6 transition-colors duration-300 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/problems"
                    className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-2xl transition-colors duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-500/20"
                  >
                    <Target className="h-4 w-4" />
                    Browse
                  </Link>

                  <Link
                    href="/archives"
                    className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-2xl transition-colors duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20"
                  >
                    <Archive className="h-4 w-4" />
                    Archives
                  </Link>

                  <Link
                    href="/leaderboard"
                    className="bg-white/80 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 font-medium px-4 py-2.5 rounded-2xl transition-colors duration-300 flex items-center justify-center gap-2 text-sm"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Leaderboard
                  </Link>

                  <Link
                    href="/profile"
                    className="bg-white/80 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 font-medium px-4 py-2.5 rounded-2xl transition-colors duration-300 flex items-center justify-center gap-2 text-sm"
                  >
                    <Users className="h-4 w-4" />
                    Profile
                  </Link>

                  <Link
                    href="/event-scoreboards"
                    className="bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700 text-white font-medium px-4 py-2.5 rounded-2xl transition-colors duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-yellow-500/20"
                  >
                    <Trophy className="h-4 w-4" />
                    Scoreboards
                  </Link>

                  <Link
                    href="/"
                    className="bg-white/80 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 font-medium px-4 py-2.5 rounded-2xl transition-colors duration-300 flex items-center justify-center gap-2 text-sm"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* MIT Partner Section */}
          <div className="mt-8 bg-white/70 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-xl backdrop-blur-md relative overflow-hidden transition-all hover:border-red-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-[0.2em]">
                  Academic Partner
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase dark:text-white">
                  Model Institute of Technology
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  Welcome to the official FlagForge instance for <strong>Model Institute of Technology (MIT College)</strong>, Kathmandu! This cyber playground is tailored to help students in Bachelor of Information Technology (BIT) and other programs build strong practical skills in cybersecurity.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  MIT College is one of Nepal's leading American Degree providers, offering BBA, BIT, and MBA degrees in affiliation with <strong>International American University (IAU), USA</strong>. With direct credit transfer opportunities and a focus on hands-on technology labs, MIT prepares students for global tech careers.
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                  Quick Facts about MIT Nepal
                </h4>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Located in Kamaladi, Kathmandu, Nepal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>U.S. Degrees & Credit Transfers to top U.S. Universities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Affiliated with International American University (IAU), USA</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <a
                    href="https://mitnepal.edu.np"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-600/10"
                  >
                    Visit mitnepal.edu.np
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Archives Section */}
          <ArchivesSection />

          {/* Scoreboards Section */}
          <ScoreboardSection />



          {/* Instagram Feed */}
          <InstagramFeed />
        </div>
      </div>
    </div>
  );
};

export default Home;
