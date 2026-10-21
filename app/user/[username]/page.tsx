'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Loading from '@/components/loading';
import {
  Trophy,
  Award,
  Flame,
  CheckCircle,
  User,
  Calendar,
  Crown,
  Share2,
  Copy,
  ExternalLink,
  Gift
} from 'lucide-react';
import Flagforge from '../../../public/flagforge.gif';
import Newbie from '../../../public/badges/0x1.png';
import Scout from '../../../public/badges/0x2.png';
import Codebreaker from '../../../public/badges/0x3.png';
import Hacker from '../../../public/badges/0x4.png';
import Cipher from '../../../public/badges/0x5.png';
import Forger from '../../../public/badges/0x6.png';
import Conqueror from '../../../public/badges/0x7.png';
import ProfileAnalytics, { SolveStats } from '@/components/ProfileAnalytics';

interface PublicProfileData {
  name: string;
  email: string;
  image: string;
  totalScore: number;
  rank: number;
  level: string;
  completedQuestions: number;
  badges: number;
  customBadges: any[];
  createdAt: string;
  memberSince: number;
  completedProblems?: any[];
  stats?: SolveStats;
}

// Badge configuration matching the private profile
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

const PublicUserPage = () => {
  const params = useParams();
  const username = params.username as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCustomBadgeTooltip, setShowCustomBadgeTooltip] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`/api/user/${encodeURIComponent(username)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load user profile');
          }
          return;
        }
        const data = await res.json();
        setProfileData(data.user);
      } catch (error) {
        setError('Failed to load user profile');
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getBadgeComponent = (score: number, size: number = 48) => {
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
  };

  const getCurrentBadgeName = (score: number) => {
    const badge = BADGE_CONFIG.slice()
      .reverse()
      .find((badge) => score >= badge.threshold);
    return badge ? badge.name : "Newbie";
  };

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

  if (loading)
    return (
      <>
        <h1 className="sr-only">FlagForge User Profile</h1>
        <h2 className="sr-only">Public CTF profile</h2>
        <h3 className="sr-only">Loading user details</h3>
        <h4 className="sr-only">Please wait</h4>
        <Loading />
      </>
    );

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-950 dark:text-white flex items-center justify-center p-6 overflow-x-hidden">
        <h2 className="sr-only">Profile not available</h2>
        <h3 className="sr-only">User data could not be loaded</h3>
        <h4 className="sr-only">Search for another profile</h4>
        <div className="max-w-md w-full bg-white/60 dark:bg-white/[0.03] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem] p-10 text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)]">
          <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">
            {error}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            The user profile you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://flagforgectf.com';
  const profileUrl = `${currentDomain}/user/${encodeURIComponent(username)}`;
  const badgeSvgUrl = `${currentDomain}/api/badge/${encodeURIComponent(username)}/svg`;

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-950 dark:text-white pb-20 overflow-x-hidden">
        <h2 className="sr-only">FlagForge public profile</h2>
        <h3 className="sr-only">CTF rank, badges, and achievements</h3>
        <h4 className="sr-only">Profile overview</h4>
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-600/5 dark:bg-red-600/[0.03] rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-5%] right-[-2%] w-[30%] h-[30%] bg-red-600/5 dark:bg-red-600/[0.03] rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />
        </div>

        {/* Hero Section */}
        <section className="relative z-30 pt-16 pb-12 border-b border-gray-100 dark:border-white/5">
          <div className="w-[92%] lg:w-[80%] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-shrink-0 relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-red-600 to-orange-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-[#0f0f0f] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-2">
                  <Image
                    src={profileData.image || Flagforge}
                    alt={`${profileData.name} Profile Picture`}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    unoptimized
                    priority
                  />
                </div>
              </div>

              <div className="flex-grow text-center lg:text-left space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] lg:leading-[0.9] text-gray-900 dark:text-white break-words">
                      {profileData.name}
                    </h1>
                    <p className="text-lg lg:text-xl font-bold text-red-600 dark:text-red-500">
                      {profileData.level}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center lg:justify-start gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm sm:text-base">
                          Member since {profileData.memberSince}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-red-600/20 to-orange-500/20 blur-xl opacity-40 transition-opacity" />
                    <div className="relative bg-white/60 dark:bg-white/[0.03] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)]">
                      <div className="flex justify-center">
                        {getBadgeComponent(profileData.totalScore, 88)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {[
                    {
                      icon: Trophy,
                      label: "Rank",
                      value: `#${profileData.rank}`,
                      color: "text-red-500",
                    },
                    {
                      icon: Award,
                      label: "System Badges",
                      value: profileData.badges,
                      color: "text-red-500",
                    },
                    {
                      icon: Crown,
                      label: "Special Badges",
                      value: profileData.customBadges?.length || 0,
                      color: "text-yellow-500",
                    },
                    {
                      icon: CheckCircle,
                      label: "Completed",
                      value: profileData.completedQuestions,
                      color: "text-red-500",
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl border border-white dark:border-white/10 rounded-[2rem] p-6 text-center transition-all hover:translate-y-[-4px] hover:shadow-2xl"
                    >
                      <stat.icon className={`w-6 h-6 lg:w-8 lg:h-8 ${stat.color} mx-auto mb-3`} />
                      <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                        {stat.label}
                      </p>
                      <p className={`text-xl lg:text-2xl font-black ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 pt-12">
          <div className="w-[92%] lg:w-[80%] mx-auto">
            <ProfileAnalytics stats={profileData.stats} />
          </div>
        </section>

        {/* Tabs Section */}
        <section className="relative z-10 py-12">
          <div className="w-[92%] lg:w-[80%] mx-auto">
            <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] shadow-sm border border-white dark:border-white/10">
              {/* Tab Navigation */}
              <div className="p-8 pb-0">
                <div className="border-b border-gray-100 dark:border-white/10">
                  <nav className="flex flex-wrap gap-6">
                    {[
                      { id: "overview", label: "Overview", icon: User },
                      { id: "badges", label: "Badge Collection", icon: Award },
                      { id: "completed", label: "Completed Problems", icon: CheckCircle },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`border-b-2 py-4 px-1 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id
                            ? "border-red-600 text-gray-900 dark:text-gray-100"
                            : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8 lg:p-12">
                {activeTab === "overview" && (
                  <div className="text-center py-10 px-6 lg:px-10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem]">
                    <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-4">
                      {profileData.name}'s Profile
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                      Current Level: {getCurrentBadgeName(profileData.totalScore)} with {profileData.totalScore.toLocaleString()} points
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/60 dark:bg-white/[0.03] border border-white dark:border-white/10 rounded-2xl p-6">
                          <p className="text-2xl font-black text-red-500">{profileData.completedQuestions}</p>
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Problems Solved</p>
                        </div>
                        <div className="bg-white/60 dark:bg-white/[0.03] border border-white dark:border-white/10 rounded-2xl p-6">
                          <p className="text-2xl font-black text-yellow-500">#{profileData.rank}</p>
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Global Rank</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "badges" && (
                  <div>
                    {/* System Badges Section */}
                    <div className="mb-16">
                      <div className="text-center mb-12">
                        <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-3">
                          System Badge Collection
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                          Badges earned through accumulated points from completed cybersecurity challenges.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {BADGE_CONFIG.map((badge) => {
                          const earned = (profileData?.totalScore || 0) >= badge.threshold;
                          const current = getCurrentBadgeName(profileData?.totalScore || 0) === badge.name;
                          return (
                                <div
                              key={badge.name}
                              className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 ${earned
                                  ? current
                                    ? `bg-gradient-to-br ${badge.color} shadow-[0_20px_40px_rgba(220,38,38,0.2)] border-red-500 text-white`
                                    : "bg-white/80 dark:bg-white/[0.02] border-gray-100/80 dark:border-white/10 hover:translate-y-[-5px] hover:shadow-2xl dark:hover:bg-white/5"
                                  : "bg-gray-100/70 dark:bg-black/20 border-gray-200 dark:border-white/5 opacity-70 dark:opacity-40 grayscale blur-0 dark:blur-[1px]"
                                }`}
                            >
                              {current && (
                                <div className="absolute -top-2 -right-2">
                                  <div className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg">
                                    Current
                                  </div>
                                </div>
                              )}
                              <div className={`mb-4 flex justify-center ${earned ? "" : "opacity-40 grayscale"}`}>
                                {getBadgeComponent(badge.threshold, 72)}
                              </div>
                              <h4 className={`text-sm font-black uppercase tracking-widest text-center mb-2 ${earned
                                  ? current
                                    ? "text-white"
                                    : "text-gray-900 dark:text-gray-100"
                                  : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {badge.name}
                              </h4>
                              <p className={`text-[10px] font-bold uppercase tracking-widest text-center ${earned
                                  ? current
                                    ? "text-red-100"
                                    : "text-gray-400 dark:text-gray-500"
                                  : "text-gray-400 dark:text-gray-500"
                                }`}
                              >
                                {badge.threshold}+ points required
                              </p>
                              {earned && !current && (
                                <div className="mt-3 text-center">
                                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-[9px] rounded-full font-black uppercase tracking-widest border border-green-200 dark:border-green-700">
                                    <CheckCircle className="w-3 h-3 inline mr-1" />
                                    Earned
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Badges Section */}
                    {profileData?.customBadges && profileData.customBadges.length > 0 && (
                      <div>
                        <div className="text-center mb-12">
                          <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-3 flex items-center justify-center">
                            <Crown className="w-6 h-6 mr-2 text-yellow-500" />
                            Special Achievement Badges
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                            Exclusive badges awarded for exceptional contributions and achievements.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                          {profileData.customBadges.map((badge, index) => (
                            <div
                              key={index}
                              className="relative p-8 rounded-[2.5rem] border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 shadow-xl hover:shadow-2xl transition-all duration-300 ring-4 ring-yellow-400/10 hover:translate-y-[-5px]"
                              onMouseEnter={() => setShowCustomBadgeTooltip(badge.name)}
                              onMouseLeave={() => setShowCustomBadgeTooltip(null)}
                            >
                              <div className="absolute -top-3 -right-3">
                                <div className="bg-yellow-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center shadow-lg">
                                  <Gift className="w-3 h-3 mr-1" />
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
                              <p className="text-sm text-center text-yellow-700 dark:text-yellow-600/80 mb-6 leading-relaxed">
                                {badge.description}
                              </p>
                              <div className="pt-6 border-t border-yellow-400/20 text-center space-y-1">
                                {/* <div className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-500">
                                  Awarded by: <span className="font-semibold">Flagforge</span>
                                </div> */}
                                <div className="text-[12px] font-bold text-yellow-600/60 dark:text-yellow-500/50">
                                  {formatDate(badge.assignedAt)}
                                </div>
                              </div>

                              {/* Custom Badge Tooltip */}
                              {showCustomBadgeTooltip === badge.name && (
                                <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 bg-[#0a0a0a]/95 backdrop-blur-xl text-white text-[11px] rounded-2xl px-4 py-3 z-20 shadow-2xl border border-white/10 w-64">
                                  <div className="text-center">
                                    <div className="font-semibold text-yellow-300">{badge.name}</div>
                                    <div className="text-gray-300">{badge.description}</div>
                                    {/* <div className="text-gray-400 mt-1">
                                      By: {badge.assignedBy}
                                    </div> */}
                                    <div className="text-gray-400 text-[10px]">
                                      {formatDate(badge.assignedAt)}
                                    </div>
                                  </div>
                                  {/* Tooltip Arrow */}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#0a0a0a]"></div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Custom Badges Message */}
                    {(!profileData?.customBadges || profileData.customBadges.length === 0) && (
                      <div className="mt-12 text-center py-20 bg-yellow-500/[0.02] border border-yellow-500/10 rounded-[3rem]">
                        <div className="w-20 h-20 bg-yellow-500/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                          <Crown className="w-10 h-10 text-yellow-500/40" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">
                          No Special Badges Yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium">
                          This user hasn't received any special badges from administrators yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "completed" && (
                  <div>
                    {profileData.completedProblems && profileData.completedProblems.length > 0 ? (
                      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {profileData.completedProblems.map((problem, index) => {
                          const diffStyle = getDifficultyStyle(problem.difficulty || 'Easy');
                          return (
                            <div
                              key={index}
                              className="group bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl border border-white dark:border-white/10 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl dark:hover:bg-white/[0.04]"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <h3 className="font-black text-lg text-gray-900 dark:text-gray-100 leading-tight uppercase tracking-tight">
                                  {problem.title}
                                </h3>
                                <span className="font-black uppercase tracking-widest text-white bg-red-500 px-3 py-1 rounded-full text-[10px] ml-3 flex-shrink-0">
                                  +{problem.points || 0}
                                </span>
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                                {problem.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${diffStyle.color} ${diffStyle.darkColor} ${diffStyle.bg} ${diffStyle.darkBg} border ${diffStyle.border} ${diffStyle.darkBorder}`}
                                >
                                  {problem.difficulty || 'Easy'}
                                </span>
                                <div className="flex gap-2">
                                  <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] rounded-full border border-green-200 dark:border-green-700 font-black uppercase tracking-widest">
                                    <CheckCircle className="w-3 h-3 inline mr-1" />
                                    Completed
                                  </span>
                                  <span className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-[9px] rounded-full border border-gray-200 dark:border-white/10 font-black uppercase tracking-widest">
                                    {getCategoryIcon(problem.category)} {problem.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : profileData.completedQuestions > 0 ? (
                      <div className="text-center py-20 bg-white/60 dark:bg-white/[0.02] border border-white dark:border-white/10 rounded-[3rem]">
                        <div className="w-20 h-20 bg-blue-500/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">
                          {profileData.completedQuestions} Problems Completed!
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 font-medium">
                          This user has successfully completed {profileData.completedQuestions} cybersecurity challenges.
                        </p>
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-2xl inline-block font-black uppercase tracking-widest text-[11px]">
                          🏆 {profileData.totalScore.toLocaleString()} Total Points Earned
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white/60 dark:bg-white/[0.02] border border-white dark:border-white/10 rounded-[3rem]">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">
                          No Problems Completed Yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium">
                          This user hasn't completed any challenges yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PublicUserPage;
