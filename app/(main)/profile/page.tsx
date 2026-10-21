"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Loading from "@/components/loading";
import AuthError from "@/components/authError";
import { useSession } from "next-auth/react";
import {
  Trophy,
  Award,
  Flame,
  CheckCircle,
  User,
  Calendar,
  Star,
  Crown,
  Share2,
  Copy,
  ArrowRight,
  Zap,
  Shield,
  Lock,
  Terminal,
  Target,
  ExternalLink,
  X,
} from "lucide-react";
import Newbie from "../../../public/badges/0x1.png";
import Scout from "../../../public/badges/0x2.png";
import Codebreaker from "../../../public/badges/0x3.png";
import Hacker from "../../../public/badges/0x4.png";
import Cipher from "../../../public/badges/0x5.png";
import Forger from "../../../public/badges/0x6.png";
import Conqueror from "../../../public/badges/0x7.png";
import Flagforge from "../../../public/flagforge.gif";

// Types
interface CustomBadge {
  _id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  assignedAt: Date;
  assignedBy: string;
}

interface ProfileData {
  name: string;
  email: string;
  image: string;
  totalScore: number;
  rank: number;
  level: string;
  completedQuestions: number;
  roomsCompleted: number;
  badges: number;
  streak: number;
  createdAt: string;
  customBadges?: CustomBadge[];
}

interface CompletedProblem {
  _id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  difficulty: string;
  completedAt: string;
}

interface CreatedRoom {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  createdAt: string;
  isPublished: boolean;
}

// Badge configuration
const BADGE_CONFIG = [
  { name: "Newbie", threshold: 0, color: "from-gray-400 to-gray-600" },
  { name: "Scout", threshold: 200, color: "from-blue-400 to-blue-600" },
  { name: "Codebreaker", threshold: 500, color: "from-green-400 to-green-600" },
  { name: "Hacker", threshold: 1000, color: "from-purple-400 to-purple-600" },
  {
    name: "Cipher Hunter",
    threshold: 1500,
    color: "from-orange-400 to-orange-600",
  },
  { name: "Forger", threshold: 2000, color: "from-red-400 to-red-600" },
  {
    name: "Flag Conqueror",
    threshold: 3000,
    color: "from-yellow-400 to-yellow-600",
  },
];

const BADGE_IMAGE_CLASS =
  "drop-shadow-[0_6px_12px_rgba(15,23,42,0.25)] dark:drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]";

const CATEGORY_ICONS: { [key: string]: string } = {
  Web: "🌐",
  Crypto: "🔐",
  Network: "📡",
  Forensics: "🔍",
  OSINT: "🕵️",
  Pwn: "💀",
  Reverse: "🔄",
  Misc: "🎯",
  Security: "🔓",
  Defense: "🛡️",
  Tutorial: "📚",
  Networking: "🌐",
};

const DIFFICULTY_CONFIG: {
  [key: string]: {
    color: string;
    bg: string;
    border: string;
    darkColor: string;
    darkBg: string;
    darkBorder: string;
  };
} = {
  Easy: {
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    darkColor: "dark:text-green-400",
    darkBg: "dark:bg-green-900/30",
    darkBorder: "dark:border-green-700",
  },
  Medium: {
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    darkColor: "dark:text-yellow-400",
    darkBg: "dark:bg-yellow-900/30",
    darkBorder: "dark:border-yellow-700",
  },
  Hard: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    darkColor: "dark:text-red-500",
    darkBg: "dark:bg-red-900/30",
    darkBorder: "dark:border-red-700",
  },
  Insane: {
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    darkColor: "dark:text-purple-400",
    darkBg: "dark:bg-purple-900/30",
    darkBorder: "dark:border-purple-700",
  },
};

// Defined at module level (not inside ProfilePage) so its error state isn't
// reset by a remount on every parent render
const ProfileImage = ({ imageSrc, displayName }: { imageSrc: any; displayName: string }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative group">
      <div className="absolute -inset-4 bg-gradient-to-br from-red-600 to-orange-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
      <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-[#0f0f0f] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-2">
        <Image
          src={(!hasError && imageSrc) ? imageSrc : Flagforge}
          alt={`${displayName} Profile Picture`}
          fill
          className="object-cover"
          unoptimized
          priority
          onError={() => setHasError(true)}
        />
      </div>
      <div className="absolute -bottom-4 -right-4 bg-white dark:bg-[#111] p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 transform group-hover:scale-110 transition-transform duration-500 z-20">
        <Shield className="w-8 h-8 text-red-600" />
      </div>
    </div>
  );
};

const ProfilePage = () => {
  // Hooks
  const { data: session, status: sessionStatus } = useSession();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [completedProblems, setCompletedProblems] = useState<CompletedProblem[]>([]);
  const [createdRooms, setCreatedRooms] = useState<CreatedRoom[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showBadgeTooltip, setShowBadgeTooltip] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("completed");
  const [showCustomBadgeTooltip, setShowCustomBadgeTooltip] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>('');

  // Pagination states for completed problems
  const [problemsCurrentPage, setProblemsCurrentPage] = useState<number>(1);
  const [problemsLoading, setProblemsLoading] = useState<boolean>(false);
  const [problemsHasNextPage, setProblemsHasNextPage] = useState<boolean>(true);
  const [totalCompletedProblems, setTotalCompletedProblems] = useState<number>(0);

  // Pagination states for created rooms
  const [roomsCurrentPage, setRoomsCurrentPage] = useState<number>(1);
  const [roomsLoading, setRoomsLoading] = useState<boolean>(false);
  const [roomsHasNextPage, setRoomsHasNextPage] = useState<boolean>(true);
  const [totalCreatedRooms, setTotalCreatedRooms] = useState<number>(0);

  // Utility Functions
  const getBadgeComponent = useCallback((score: number, size: number = 48) => {
    if (score < 200)
      return (
        <Image
          src={Newbie}
          alt="Newbie"
          width={size}
          height={size}
          className={BADGE_IMAGE_CLASS}
        />
      );
    if (score < 500)
      return (
        <Image
          src={Scout}
          alt="Scout"
          width={size}
          height={size}
          className={BADGE_IMAGE_CLASS}
        />
      );
    if (score < 1000)
      return (
        <Image
          src={Codebreaker}
          alt="Codebreaker"
          width={size}
          height={size}
          className={BADGE_IMAGE_CLASS}
        />
      );
    if (score < 1500)
      return (
        <Image
          src={Hacker}
          alt="Hacker"
          width={size}
          height={size}
          className={BADGE_IMAGE_CLASS}
        />
      );
    if (score < 2000)
      return (
        <Image
          src={Cipher}
          alt="Cipher Hunter"
          width={size}
          height={size}
          className={BADGE_IMAGE_CLASS}
        />
      );
    if (score < 3000)
      return (
        <Image
          src={Forger}
          alt="Forger"
          width={size}
          height={size}
          className={BADGE_IMAGE_CLASS}
        />
      );
    return (
      <Image
        src={Conqueror}
        alt="Flag Conqueror"
        width={size}
        height={size}
        className={BADGE_IMAGE_CLASS}
      />
    );
  }, []);

  const getCurrentBadgeName = useCallback((score: number) => {
    const badge = BADGE_CONFIG.slice()
      .reverse()
      .find((badge) => score >= badge.threshold);
    return badge ? badge.name : "Newbie";
  }, []);

  const getNextBadgeInfo = useCallback((score: number) => {
    const nextBadge = BADGE_CONFIG.find((badge) => score < badge.threshold);
    if (!nextBadge) return null;
    const currentBadge = BADGE_CONFIG.filter(
      (badge) => score >= badge.threshold
    ).pop();
    const currentThreshold = currentBadge ? currentBadge.threshold : 0;
    const range = nextBadge.threshold - currentThreshold;
    const progress = ((score - currentThreshold) / range) * 100;
    return {
      nextThreshold: nextBadge.threshold,
      pointsNeeded: nextBadge.threshold - score,
      progress: Math.min(progress, 100),
      nextBadgeName: nextBadge.name,
    };
  }, []);

  const getImageSrc = useCallback(() => {
    const sources = [profileData?.image, session?.user?.image];
    for (const src of sources) {
      if (
        src &&
        typeof src === "string" &&
        src.trim() !== "" &&
        src !== "undefined" &&
        src !== "null" &&
        src.toLowerCase() !== "null"
      ) {
        return src;
      }
    }
    return null;
  }, [profileData?.image, session?.user?.image]);

  const getCategoryIcon = (category: string) => CATEGORY_ICONS[category] || "📝";
  const getDifficultyStyle = (difficulty: string) => DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG["Easy"];

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // API Functions
  const fetchProfileData = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/profile`, {
        method: "GET",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
      });
      if (!res.ok)
        throw new Error(`Failed to fetch profile data: ${res.status}`);
      const data = await res.json();
      setProfileData(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (error) {
      setError("Failed to load profile data");
      console.error("Profile fetch error:", error);
    }
  }, [session?.user?.email]);

  const fetchCompletedProblems = useCallback(async () => {
    if (!session?.user?.email) return;
    setProblemsLoading(true);
    try {
      const res = await fetch(
        `/api/problems/completed?page=${problemsCurrentPage}`,
        {
          method: "GET",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        }
      );
      if (!res.ok)
        throw new Error(`Failed to fetch completed problems: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        const {
          completedProblems: problemsData = [],
          totalProblems,
          hasMore,
          totalPages,
        } = data;
        setCompletedProblems(problemsData);
        setTotalCompletedProblems(totalProblems || problemsData.length);
        if (hasMore !== undefined) {
          setProblemsHasNextPage(hasMore);
        } else if (totalPages !== undefined) {
          setProblemsHasNextPage(problemsCurrentPage < totalPages);
        } else if (problemsData.length === 0) {
          setProblemsHasNextPage(false);
          if (problemsCurrentPage > 1)
            setProblemsCurrentPage((prev) => prev - 1);
        } else {
          setProblemsHasNextPage(true);
        }
      } else {
        setCompletedProblems([]);
        setTotalCompletedProblems(0);
        setProblemsHasNextPage(false);
      }
    } catch (error) {
      console.error("Failed to load completed problems:", error);
      setCompletedProblems([]);
      setTotalCompletedProblems(0);
      setProblemsHasNextPage(false);
    } finally {
      setProblemsLoading(false);
    }
  }, [session?.user?.email, problemsCurrentPage]);

  const fetchCreatedRooms = useCallback(async () => {
    if (!session?.user?.email) return;
    setRoomsLoading(true);
    try {
      const res = await fetch(`/api/rooms/created?page=${roomsCurrentPage}`, {
        method: "GET",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
      });
      if (res.status === 404) {
        setCreatedRooms([]);
        setTotalCreatedRooms(0);
        setRoomsHasNextPage(false);
        return;
      }
      if (!res.ok)
        throw new Error(`Failed to fetch created rooms: ${res.status}`);
      const data = await res.json();
      const {
        createdRooms: roomsData = [],
        totalRooms,
        hasMore,
        totalPages,
      } = data;
      setCreatedRooms(roomsData);
      setTotalCreatedRooms(totalRooms || roomsData.length);
      if (hasMore !== undefined) {
        setRoomsHasNextPage(hasMore);
      } else if (totalPages !== undefined) {
        setRoomsHasNextPage(roomsCurrentPage < totalPages);
      } else if (roomsData.length === 0) {
        setRoomsHasNextPage(false);
        if (roomsCurrentPage > 1) setRoomsCurrentPage((prev) => prev - 1);
      } else {
        setRoomsHasNextPage(true);
      }
    } catch (error) {
      console.error("Failed to load created rooms:", error);
      setCreatedRooms([]);
      setTotalCreatedRooms(0);
      setRoomsHasNextPage(false);
    } finally {
      setRoomsLoading(false);
    }
  }, [session?.user?.email, roomsCurrentPage]);

  // Pagination handlers
  const handleProblemsNextPage = () => {
    if (problemsHasNextPage && !problemsLoading)
      setProblemsCurrentPage((prev) => prev + 1);
  };

  const handleProblemsPrevPage = () => {
    if (problemsCurrentPage > 1 && !problemsLoading)
      setProblemsCurrentPage((prev) => prev - 1);
  };

  const handleRoomsNextPage = () => {
    if (roomsHasNextPage && !roomsLoading)
      setRoomsCurrentPage((prev) => prev + 1);
  };

  const handleRoomsPrevPage = () => {
    if (roomsCurrentPage > 1 && !roomsLoading)
      setRoomsCurrentPage((prev) => prev - 1);
  };

  // Effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session) {
      const loadData = async () => {
        await fetchProfileData();
        await fetchCompletedProblems();
        setLoading(false);
      };
      loadData();
      interval = setInterval(() => {
        fetchProfileData();
        if (activeTab === "completed") fetchCompletedProblems();
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    session,
    activeTab,
    fetchProfileData,
    fetchCompletedProblems,
    fetchCreatedRooms,
  ]);

  useEffect(() => {
    if (activeTab === "completed") setProblemsCurrentPage(1);
    else if (activeTab === "created") setRoomsCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "completed" && session?.user?.email)
      fetchCompletedProblems();
  }, [
    problemsCurrentPage,
    activeTab,
    session?.user?.email,
    fetchCompletedProblems,
  ]);

  useEffect(() => {
    if (activeTab === "created" && session?.user?.email) fetchCreatedRooms();
  }, [roomsCurrentPage, activeTab, session?.user?.email, fetchCreatedRooms]);

  // Components
  const CustomBadgeDisplay = () => {
    if (!profileData?.customBadges || profileData.customBadges.length === 0) return null;

    return (
      <div className="relative group mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent border border-yellow-500/20 dark:border-yellow-500/10 rounded-[2.5rem] overflow-hidden">
          <div className="absolute top-0 right-0 p-8 transform translate-x-12 -translate-y-12 opacity-[0.03] dark:opacity-[0.05] group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-700">
            <Crown className="w-40 h-40 text-yellow-500" />
          </div>
        </div>
        <div className="relative p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-yellow-600 dark:text-yellow-500 flex items-center justify-center lg:justify-start gap-2">
              <Crown className="w-5 h-5" />
              <span>Special Achievement Vault</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md font-medium">Prestigious honors bestowed upon the most dedicated seekers of the arena.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {profileData.customBadges.map((badge, index) => (
              <div
                key={index}
                className="relative group/badge cursor-pointer"
                onMouseEnter={() => setShowCustomBadgeTooltip(badge.name)}
                onMouseLeave={() => setShowCustomBadgeTooltip(null)}
              >
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full p-1 bg-gradient-to-tr from-yellow-500 to-orange-500 animate-spin-slow opacity-20" />
                <div className="absolute inset-1 rounded-full overflow-hidden border-2 border-white dark:border-[#0a0a0a] shadow-xl transform transition-transform group-hover/badge:scale-110 z-10">
                  <Image src={badge.icon} alt={badge.name} fill className="object-cover" unoptimized />
                </div>

                {showCustomBadgeTooltip === badge.name && (
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-[#0a0a0a]/95 backdrop-blur-xl text-white p-4 rounded-2xl z-50 text-center shadow-2xl animate-in zoom-in-95 fade-in duration-200 border border-white/10">
                    <p className="font-black uppercase text-[11px] text-yellow-500 tracking-widest mb-1">{badge.name}</p>
                    <p className="text-xs font-medium text-gray-300 leading-relaxed mb-2">{badge.description}</p>
                    <div className="border-t border-white/10 pt-2 mt-2 flex items-center justify-center gap-2 text-[9px] font-bold text-gray-500 uppercase">
                      {/* <span>Awarded by: FlagForge</span> */}
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>{formatDate(badge.assignedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const BadgeTooltip = () => {
    if (!showBadgeTooltip) return null;
    return (
      <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-[85vw] sm:w-80 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] z-[100] animate-in fade-in slide-in-from-top-4 pointer-events-none">
        <h5 className="text-sm font-black uppercase tracking-widest text-center mb-4 text-gray-400 dark:text-gray-500">Badge Progress</h5>
        <div className="grid grid-cols-2 gap-3">
          {BADGE_CONFIG.map((badge) => {
            const earned = (profileData?.totalScore || 0) >= badge.threshold;
            const active = getCurrentBadgeName(profileData?.totalScore || 0) === badge.name;
            return (
              <div key={badge.name} className={`p-3 rounded-2xl border transition-all ${earned ? (active ? 'border-red-500 bg-red-500/10' : 'border-green-500/20 bg-green-500/5') : 'border-gray-100 dark:border-white/5 opacity-40'}`}>
                <div className="flex justify-center mb-2">{getBadgeComponent(badge.threshold, 24)}</div>
                <p className="text-[10px] font-black uppercase text-center text-gray-700 dark:text-gray-300">{badge.name}</p>
                <p className="text-[8px] text-gray-500 text-center uppercase tracking-tighter">({badge.threshold}+ PTS)</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const HeroStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
      {[
        {
          icon: Trophy,
          label: "Rank",
          value: `#${profileData?.rank || "N/A"}`,
          color: "text-red-600"
        },
        {
          icon: Target,
          label: "System Badges",
          value: profileData?.badges || 0,
          color: "text-red-600"
        },
        {
          icon: Crown,
          label: "Special Badges",
          value: profileData?.customBadges?.length || 0,
          color: "text-orange-500"
        },
        {
          icon: Flame,
          label: "Streak",
          value: profileData?.streak || 0,
          color: "text-red-600"
        },
        {
          icon: CheckCircle,
          label: "Completed",
          value: profileData?.completedQuestions || profileData?.roomsCompleted || 0,
          color: "text-red-600"
        },
      ].map((stat, index) => (
        <div key={index} className="group bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl border border-white dark:border-white/10 rounded-[2rem] p-5 lg:p-8 text-center transition-all hover:translate-y-[-5px] hover:shadow-xl dark:hover:bg-white/[0.04]">
          <div className={`inline-flex p-3 rounded-2xl bg-gray-50 dark:bg-white/5 mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
            <stat.icon className="w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{stat.label}</p>
          <p className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );

  const TabNavigation = () => (
    <div className="flex justify-center mb-12 overflow-x-auto pb-4 no-scrollbar">
      <div className="inline-flex bg-gray-100 dark:bg-white/[0.03] p-2 rounded-[2rem] border border-gray-200 dark:border-white/10 min-w-max">
        {[
          { id: "completed", label: "Completed", icon: CheckCircle, count: totalCompletedProblems },
          { id: "badges", label: "Badges", icon: Award, count: null },
          // "Rooms" tab hidden until an /api/rooms/created endpoint exists
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 lg:px-8 py-3 lg:py-4 rounded-[1.5rem] text-xs lg:text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${activeTab === tab.id
              ? 'bg-red-600 text-white shadow-xl shadow-red-600/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== null && <span className="opacity-60">({tab.count})</span>}
          </button>
        ))}
      </div>
    </div>
  );

  // Render conditions
  // Check auth first: `loading` only clears once a session exists, so a
  // logged-out visitor would otherwise see the spinner forever
  if (sessionStatus === "unauthenticated") return <AuthError />;
  if (loading || sessionStatus === "loading") return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Unable to Load Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchProfileData}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const nextBadge = getNextBadgeInfo(profileData?.totalScore || 0);
  const memberSince = profileData?.createdAt
    ? new Date(profileData.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-950 dark:text-white pb-20 overflow-x-hidden">

      {/* Elite Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-600/5 dark:bg-red-600/[0.03] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-2%] w-[30%] h-[30%] bg-red-600/5 dark:bg-red-600/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />
      </div>

      {/* Hero Section */}
      <section className="relative z-30 pt-12 pb-10 border-b border-gray-100 dark:border-white/5">
        <div className="w-[92%] lg:w-[80%] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Avatar Column */}
            <div className="relative group">
              <ProfileImage
                imageSrc={getImageSrc()}
                displayName={profileData?.name || session?.user?.name || "User"}
              />
            </div>

            {/* Info Column */}
            <div className="flex-1 text-center lg:text-left space-y-4 lg:space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-[0.2em]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Verified Operator</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tighter leading-[1.1] lg:leading-[0.9] text-gray-900 dark:text-white">
                  {profileData?.name || session?.user?.name || "User"}
                </h1>
                <p className="text-lg lg:text-xl font-bold text-red-600 dark:text-red-500 flex items-center justify-center lg:justify-start gap-2">
                  <Crown className="w-5 h-5" />
                  {profileData?.level || "[0x1][NEWBIE]"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <User className="w-4 h-4" />
                  <span className="break-all">{profileData?.email || session?.user?.email}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Badge Card Column */}
            <div className="lg:w-72">
              <div
                className="relative group cursor-pointer perspective-1000"
                onMouseEnter={() => setShowBadgeTooltip(true)}
                onMouseLeave={() => setShowBadgeTooltip(false)}
              >
                <div className="absolute -inset-2 bg-gradient-to-br from-red-600/20 to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white/60 dark:bg-white/[0.03] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] text-center transition-all duration-500 group-hover:translate-y-[-5px]">
                  <div className="flex justify-center mb-6">
                    {getBadgeComponent(profileData?.totalScore || 0, 96)}
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Current Standing</span>
                  <h4 className="text-xl font-black mt-1 uppercase tracking-tight text-gray-900 dark:text-white">
                    {getCurrentBadgeName(profileData?.totalScore || 0)}
                  </h4>
                </div>

                {BadgeTooltip()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Stats Section */}
      <section className="relative z-10 py-12">
        <div className="w-[92%] lg:w-[80%] mx-auto space-y-8">

          {/* Progress Bar Container */}
          <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">Capture Mastery</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">{profileData?.totalScore?.toLocaleString() || 0}</span>
                  <span className="text-xl font-bold text-red-600">PTS</span>
                </div>
              </div>

              {nextBadge && (
                <div className="flex-1 max-w-xl w-full space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-2">
                    <p className="text-sm lg:text-base font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Next Level: <span className="text-red-500">{nextBadge.nextBadgeName}</span>
                    </p>
                    <p className="text-xs lg:text-sm font-bold text-gray-500 dark:text-gray-400">{nextBadge.pointsNeeded} UNTIL CLEARANCE</p>
                  </div>
                  <div className="relative h-4 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-1 border border-gray-200 dark:border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      style={{ width: `${nextBadge.progress}%` }}
                    />
                  </div>
                  <p className="text-right text-[10px] font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                    {nextBadge.progress.toFixed(1)}% System Clearance
                  </p>
                </div>
              )}
            </div>
          </div>

          {HeroStats()}

          {CustomBadgeDisplay()}
        </div>
      </section>

      {/* Main Tabs Content */}
      <section className="relative z-10 py-12">
        <div className="w-[92%] lg:w-[80%] mx-auto">

          {/* Prestigious Tab Header */}
          {TabNavigation()}

          {/* Tab Content Panels */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === "completed" && (
              <div>
                {problemsLoading && (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  </div>
                )}
                {!problemsLoading && completedProblems.length > 0 ? (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                      {completedProblems.map((p) => {
                        const diff = getDifficultyStyle(p.difficulty);
                        return (
                          <div key={p._id} className="group h-full min-h-[320px] flex flex-col bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl border border-white dark:border-white/10 rounded-[2rem] p-8 transition-all hover:translate-y-[-5px] hover:shadow-xl dark:hover:bg-white/[0.04]">
                            <div className="flex justify-between items-start mb-6">
                              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-2xl">
                                {getCategoryIcon(p.category)}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xl font-black tracking-tight text-red-600">+{p.points}</span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${diff.color} ${diff.darkColor} ${diff.bg} ${diff.darkBg} ${diff.border} ${diff.darkBorder} uppercase tracking-widest`}>
                                  {p.difficulty}
                                </span>
                              </div>
                            </div>
                            <h4 className="text-lg font-black tracking-tight mb-3 group-hover:text-red-500 transition-colors uppercase text-gray-900 dark:text-gray-100">
                              {p.title}
                            </h4>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-2 text-ellipsis overflow-hidden leading-relaxed mb-6 flex-1 min-h-[48px]">
                              {p.description}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-gray-400 dark:text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>Completed {formatDate(p.completedAt)}</span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Pagination */}
                    {(completedProblems.length > 0 || problemsCurrentPage > 1) && (
                      <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-white/5">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          Page {problemsCurrentPage}{" "}
                          {totalCompletedProblems > 0 &&
                            `• ${totalCompletedProblems} problems total`}
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={handleProblemsPrevPage}
                            disabled={problemsCurrentPage === 1 || problemsLoading}
                            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${problemsCurrentPage === 1 || problemsLoading
                              ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95"
                              }`}
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleProblemsNextPage}
                            disabled={!problemsHasNextPage || problemsLoading}
                            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!problemsHasNextPage || problemsLoading
                              ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95"
                              }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : !problemsLoading && completedProblems.length === 0 ? (
                  <div className="text-center py-20 bg-white/60 dark:bg-white/[0.02] border border-white dark:border-white/10 rounded-[3rem]">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">
                      {problemsCurrentPage === 1 ? "No Problems Completed Yet" : "No More Problems"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium">
                      {problemsCurrentPage === 1
                        ? "Start solving challenges to build your portfolio and earn badges!"
                        : "You've reached the end of your completed problems."}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "badges" && (
              <div className="space-y-16">
                {/* System Badges Section */}
                <div className="space-y-10">
                  <div className="text-center space-y-3">
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-gray-100">System Badge Collection</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">Unlock prestigious badges by accumulating points through completed challenges.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BADGE_CONFIG.map((b) => {
                      const earned = (profileData?.totalScore || 0) >= b.threshold;
                      const active = getCurrentBadgeName(profileData?.totalScore || 0) === b.name;
                      return (
                        <div key={b.name} className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 ${earned
                          ? (active ? 'bg-red-600 shadow-[0_20px_40px_rgba(220,38,38,0.2)] border-red-500 text-white' : 'bg-white/80 dark:bg-white/[0.02] dark:border-white/10 border-gray-100/80 hover:bg-white dark:hover:bg-white/5 hover:translate-y-[-5px]')
                          : 'bg-gray-100/70 dark:bg-black/20 border-gray-200 dark:border-white/5 opacity-70 dark:opacity-40 grayscale blur-0 dark:blur-[1px]'}`}>

                          {active && (
                            <div className="absolute top-4 right-4 animate-bounce">
                              <Crown className="w-4 h-4 text-yellow-300" />
                            </div>
                          )}

                          <div className="flex justify-center mb-8 transform group-hover:scale-110 transition-transform duration-500">
                            {getBadgeComponent(b.threshold, 80)}
                          </div>
                          <h5 className="text-sm font-black text-center uppercase tracking-widest mb-1">{b.name}</h5>
                          <p className={`text-[10px] font-bold text-center uppercase tracking-tighter ${active ? 'text-red-100' : 'text-gray-400'}`}>
                            {b.threshold} POINTS THRESHOLD
                          </p>

                          {earned && (
                            <div className={`mt-6 flex justify-center ${active ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                              <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                Active Standing
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Badges Section */}
                {profileData?.customBadges && profileData.customBadges.length > 0 && (
                  <div className="space-y-10">
                    <div className="text-center space-y-3">
                      <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-gray-100 flex items-center justify-center gap-4">
                        <Crown className="w-10 h-10 text-yellow-500" />
                        Special Achievement Badges
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">Exclusive honors awarded by administrators for exceptional contributions.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {profileData.customBadges.map((badge, index) => (
                        <div
                          key={index}
                          className="relative p-8 rounded-[2.5rem] border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 shadow-xl hover:translate-y-[-5px] transition-all duration-300 ring-4 ring-yellow-400/10"
                        >
                          <div className="absolute -top-3 -right-3">
                            <div className="bg-yellow-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center shadow-lg">
                              <Shield className="w-3 h-3 mr-1" />
                              Special
                            </div>
                          </div>
                          <div className="mb-6 flex justify-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-400 shadow-2xl ring-4 ring-yellow-400/20">
                              <Image
                                src={badge.icon}
                                alt={badge.name}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null; e.currentTarget.src = '/flagforge-logo.png';
                                }}
                              />
                            </div>
                          </div>
                          <h4 className="font-black text-center mb-2 text-lg text-yellow-800 dark:text-yellow-500 uppercase tracking-tight">
                            {badge.name}
                          </h4>
                          <p className="text-xs font-medium text-center text-yellow-700 dark:text-yellow-600/80 mb-6 leading-relaxed">
                            {badge.description}
                          </p>
                          <div className="pt-6 border-t border-yellow-400/20 text-center space-y-1">
                            {/* <div className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-500">
                              Awarded by: {badge.assignedBy}
                            </div> */}
                            <div className="text-[12px] font-bold text-yellow-600/60 dark:text-yellow-500/50">
                              {formatDate(badge.assignedAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!profileData?.customBadges || profileData.customBadges.length === 0) && (
                  <div className="text-center py-20 bg-yellow-500/[0.02] border border-yellow-500/10 rounded-[3rem]">
                    <div className="w-20 h-20 bg-yellow-500/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <Crown className="w-10 h-10 text-yellow-500/40" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">No Special Badges Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium">Keep contributing to the community to earn exclusive honors!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "created" && (
              <div className="space-y-12">
                {roomsLoading && (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  </div>
                )}
                {!roomsLoading && createdRooms.length > 0 ? (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                      {createdRooms.map((r) => {
                        const diff = getDifficultyStyle(r.difficulty);
                        return (
                          <div key={r._id} className="group h-full min-h-[360px] flex flex-col bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl border border-white dark:border-white/10 rounded-[3rem] p-10 transition-all hover:shadow-2xl dark:hover:bg-white/[0.04]">
                            <div className="flex items-start justify-between mb-8">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-3xl shadow-inner">
                                  {getCategoryIcon(r.category)}
                                </div>
                                <div>
                                  <h4 className="text-xl font-black uppercase tracking-tight mb-1 text-gray-900 dark:text-gray-100">{r.title}</h4>
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>Created {new Date(r.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${r.isPublished ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                {r.isPublished ? 'Live Protocol' : 'Draft Protocol'}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-8 line-clamp-2 text-ellipsis overflow-hidden flex-1 min-h-[48px]">
                              {r.description}
                            </p>
                            <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-white/5">
                              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${diff.color} ${diff.darkColor} ${diff.bg} ${diff.darkBg} ${diff.border} ${diff.darkBorder} uppercase tracking-[0.2em]`}>
                                {r.difficulty} LEVEL
                              </span>
                              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-500 hover:gap-4 transition-all group/btn">
                                Inspect Forge <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Pagination */}
                    {(createdRooms.length > 0 || roomsCurrentPage > 1) && (
                      <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-white/5">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          Page {roomsCurrentPage}{" "}
                          {totalCreatedRooms > 0 && `• ${totalCreatedRooms} rooms total`}
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={handleRoomsPrevPage}
                            disabled={roomsCurrentPage === 1 || roomsLoading}
                            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${roomsCurrentPage === 1 || roomsLoading
                              ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95"
                              }`}
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleRoomsNextPage}
                            disabled={!roomsHasNextPage || roomsLoading}
                            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!roomsHasNextPage || roomsLoading
                              ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95"
                              }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : !roomsLoading && createdRooms.length === 0 ? (
                  <div className="text-center py-20 bg-white/60 dark:bg-white/[0.02] border border-white dark:border-white/10 rounded-[3rem]">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <Star className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">
                      {roomsCurrentPage === 1 ? "No Rooms Created Yet" : "No More Rooms"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto font-medium">
                      {roomsCurrentPage === 1
                        ? "Share your knowledge by creating cybersecurity challenges for the community!"
                        : "You've reached the end of your created rooms."}
                    </p>
                    {roomsCurrentPage === 1 && (
                      <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center gap-3 mx-auto">
                        <Star className="w-4 h-4" />
                        <span>Create Your First Room</span>
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Identity & Share Section */}
      <section className="relative z-10 py-12 border-t border-gray-100 dark:border-white/5">
        <div className="w-[92%] lg:w-[80%] mx-auto bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[3rem] p-12 text-center group">
          <div className="inline-flex p-4 rounded-3xl bg-gray-50 dark:bg-white/5 mb-6 group-hover:scale-110 transition-transform text-red-600">
            <Share2 className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-4">Export Your Persona</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium mb-10 leading-relaxed">
            Generate a prestigious profile badge to showcase your system clearances on GitHub, LinkedIn, and professional networks.
          </p>
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
          >
            <Terminal className="w-4 h-4" />
            <span>Generate Share Protocol</span>
          </button>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-md transition-opacity animate-in fade-in"
            onClick={() => setShowShareModal(false)}
          />
          <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] scale-95 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-600 text-white">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Profile Protocol</h3>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  aria-label="Close"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {(() => {
                  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://flagforgectf.com';
                  const slug = (profileData?.name || "").replace(/\s+/g, "-");
                  const profileUrl = `${currentDomain}/user/${encodeURIComponent(slug)}`;
                  const badgeSvgUrl = `${currentDomain}/api/badge/${encodeURIComponent(slug)}/svg`;

                  return (
                    <>
                      <div className="bg-gray-50 dark:bg-white/[0.03] rounded-2xl p-4 flex flex-col items-center border border-gray-100 dark:border-white/5">
                        <div className="w-full overflow-hidden rounded-lg shadow-sm mb-2">
                          <img
                            src={badgeSvgUrl}
                            alt={`${profileData?.name}'s Stat Badge`}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Live Status Protocol</p>
                      </div>

                      <div className="space-y-3">
                        {[
                          {
                            label: "Direct Link",
                            value: profileUrl,
                            icon: ExternalLink
                          },
                          {
                            label: "Markdown",
                            value: `[![${profileData?.name || ''}'s FlagForge Badge](${badgeSvgUrl})](${profileUrl})`,
                            icon: Terminal
                          },
                          {
                            label: "HTML Snippet",
                            value: `<a href="${profileUrl}"><img src="${badgeSvgUrl}" alt="${profileData?.name || ''}'s FlagForge Badge" /></a>`,
                            icon: Lock
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 pl-1">{item.label}</label>
                            <div className="flex gap-2">
                              <div className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-[11px] font-medium text-gray-500 truncate">
                                {item.value}
                              </div>
                              <button
                                onClick={() => copyToClipboard(item.value, item.label)}
                                aria-label={`Copy ${item.label}`}
                                className="relative group p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all active:scale-90 shadow-lg shadow-red-600/20"
                              >
                                {copiedText === item.label ? (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                <span className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-all duration-200 ease-in-out group-hover:opacity-100 group-hover:-translate-y-10 group-focus-visible:opacity-100 group-focus-visible:-translate-y-10 scale-95 group-hover:scale-100 group-focus-visible:scale-100">
                                  {copiedText === item.label ? 'Copied!' : `Copy ${item.label}`}
                                </span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}

                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity mt-2"
                >
                  Protocol Terminated
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
