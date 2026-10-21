'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Upload, 
  Award, 
  LayoutTemplate, 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  ChevronRight,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  Archive,
  Trophy
} from 'lucide-react';
import Loading from '@/components/loading';

// Type definitions for dashboard stats
interface DashboardStats {
  totalChallenges: number;
  activeChallenges: number;
  totalBadgeTemplates: number;
  activeBadgeTemplates: number;
  totalUsers: number;
  recentActivity: number;
  newUsersThisWeek: number;
  topCategories: Array<{ _id: string; count: number }>;
  totalArchivedChallenges: number;
  lastUpdated: string;
}

// Admin card component
interface AdminCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  onClick: () => void;
}

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  description,
  icon,
  color,
  path,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`group relative overflow-hidden rounded-3xl border border-white/20 p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${color}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-5">
        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
          {icon}
        </div>
        <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/85 text-sm leading-relaxed">{description}</p>
      <div className="mt-5 text-xs text-white/60 font-semibold tracking-wide">
        Navigate to {path}
      </div>
    </div>
  </div>
);

// Stats card component
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, trend }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/70">
    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />
    <div className="relative flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
        <div className="flex items-baseline space-x-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {trend && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-2xl shadow-inner ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalChallenges: 0,
    activeChallenges: 0,
    totalBadgeTemplates: 0,
    activeBadgeTemplates: 0,
    totalUsers: 0,
    recentActivity: 0,
    newUsersThisWeek: 0,
    topCategories: [],
    totalArchivedChallenges: 0,
    lastUpdated: ''
  });

  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication and admin check
  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      if (status === 'loading') return;
      
      if (!session?.user) {
        router.push('/roles/developers/admins/auth');
        return;
      }

      try {
        setAdminCheckLoading(true);
        console.log('Checking admin status for dashboard:', session.user.email);
        
        const response = await fetch('/api/auth/check-admin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache'
        });
        
        const data = await response.json();
        console.log('Admin check response in dashboard:', response.status, data);
        
        if (response.ok && data.isAdmin) {
          console.log('Admin access verified for dashboard');
          setIsAuthenticated(true);
        } else {
          console.log('Admin access denied for dashboard:', data.message);
          router.push('/roles/developers/admins/auth');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status in dashboard:', error);
        router.push('/roles/developers/admins/auth');
        return;
      } finally {
        setAdminCheckLoading(false);
        setLoading(false);
      }
    };

    checkAuthAndAdmin();
  }, [session, status, router]);

  // Fetch dashboard stats
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...');
      const response = await fetch('/api/admin/dashboard-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dashboard stats received:', data);

      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        console.error('Invalid stats response:', data);
        // Keep current stats if API fails
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep current stats if API fails - no need to show error to user
    }
  };

  const handleLogout = async (): Promise<void> => {
    const { signOut } = await import('next-auth/react');
    await signOut({ redirect: false });
    router.push('/roles/developers/admins/auth');
  };

  const adminCards = [
    {
      title: "Upload Challenge",
      description: "Create and upload new CTF challenges with hints, time limits, and resource links.",
      icon: <Upload className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-rose-500 to-pink-600",
      path: "/uploads",
      onClick: () => router.push('/roles/developers/admins/uploads')
    },
    {
      title: "Manage Challenges",
      description: "Edit, update, and delete existing CTF challenges from the platform.",
      icon: <Settings className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-cyan-500 to-blue-600",
      path: "/manage-challenges",
      onClick: () => router.push('/roles/developers/admins/manage-challenges')
    },
    {
      title: "Learning Paths",
      description: "Group challenges into ordered tracks that players unlock step by step.",
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-rose-500 to-red-600",
      path: "/paths",
      onClick: () => router.push('/roles/developers/admins/paths')
    },
    {
      title: "Event Scoreboards",
      description: "Manage CTF event results, winners, and team performance data from competitions.",
      icon: <Trophy className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-yellow-500 to-orange-600",
      path: "/event-scoreboards",
      onClick: () => router.push('/roles/developers/admins/event-scoreboards')
    },
    {
      title: "Assign Badges",
      description: "Assign achievement badges to users based on their performance and accomplishments.",
      icon: <Award className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      path: "/badges",
      onClick: () => router.push('/roles/developers/admins/badges')
    },
    {
      title: "Badge Templates",
      description: "Create and manage badge templates for different types of achievements and recognitions.",
      icon: <LayoutTemplate className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      path: "/badge-templates",
      onClick: () => router.push('/roles/developers/admins/badge-templates')
    },
    {
      title: "CTF Archives",
      description: "Manage archived challenges from past CTF competitions like PGS CTF 2026.",
      icon: <Archive className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-violet-500 to-purple-600",
      path: "/archives",
      onClick: () => router.push('/roles/developers/admins/archives')
    },
    {
      title: "Resources",
      description: "Add resources for user to learn more about cybersecurity.",
      icon: <LayoutTemplate className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      path: "/resources/upload",
      onClick: () => router.push('/resources/upload')
    }
  ];

  // Show loading while checking session or admin status
  if (status === 'loading' || loading || adminCheckLoading) {
    return <Loading />;
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated || !session?.user) {
    return null;
  }

  const userName = session.user.name || session.user.email?.split('@')[0] || 'Admin';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-blue-200/70 blur-3xl dark:bg-blue-900/30" />
      <div className="pointer-events-none absolute -bottom-28 left-[-10%] h-96 w-96 rounded-full bg-rose-200/60 blur-3xl dark:bg-rose-900/30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_55%)]" />
      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 via-transparent to-white/40 opacity-70 dark:from-blue-900/20 dark:to-slate-950/10" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-slate-900/20 dark:bg-white">
                  <Shield className="w-7 h-7 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Welcome back, {userName}
                  </p>
                  {stats.lastUpdated && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Last updated: {new Date(stats.lastUpdated).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                Manage CTF challenges, assign badges, and oversee platform activities from your central control panel.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/problems')}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Activity className="w-4 h-4" />
                <span>View Challenges</span>
              </button>
              <button
                onClick={fetchDashboardStats}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-500"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Refresh Stats</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
          <StatsCard
            title="Total Challenges"
            value={stats.totalChallenges}
            icon={<Upload className="w-6 h-6 text-white" />}
            color="bg-rose-500"
          />
          <StatsCard
            title="Active Challenges"
            value={stats.activeChallenges}
            icon={<Activity className="w-6 h-6 text-white" />}
            color="bg-green-500"
          />
          <StatsCard
            title="Archived Challenges"
            value={stats.totalArchivedChallenges}
            icon={<Archive className="w-6 h-6 text-white" />}
            color="bg-violet-500"
          />
          <StatsCard
            title="Badge Templates"
            value={`${stats.activeBadgeTemplates}/${stats.totalBadgeTemplates}`}
            icon={<LayoutTemplate className="w-6 h-6 text-white" />}
            color="bg-purple-500"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            trend={stats.newUsersThisWeek > 0 ? `+${stats.newUsersThisWeek} this week` : undefined}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Admin Actions */}
          <div className="xl:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-transparent opacity-70 dark:from-blue-900/20" />
              <div className="relative flex items-center space-x-3 mb-8">
                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Admin Actions
                </h2>
              </div>
              
              <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-1">
                {adminCards.map((card, index) => (
                  <AdminCard
                    key={index}
                    title={card.title}
                    description={card.description}
                    icon={card.icon}
                    color={card.color}
                    path={card.path}
                    onClick={card.onClick}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Info Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2 bg-emerald-500 rounded-2xl shadow-md shadow-emerald-500/30">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  System Status
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Platform Health
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    Excellent
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/80 p-3 dark:border-blue-900/40 dark:bg-blue-900/20">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Sessions
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {stats.recentActivity}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-purple-100 bg-purple-50/80 p-3 dark:border-purple-900/40 dark:bg-purple-900/20">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Badge Assignments
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {stats.activeBadgeTemplates} Active
                  </span>
                </div>
              </div>
            </div>

            {/* Category Insights */}
            {stats.topCategories.length > 0 && (
              <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="p-2 bg-indigo-500 rounded-2xl shadow-md shadow-indigo-500/30">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Top Categories
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {stats.topCategories.slice(0, 3).map((category, index) => (
                    <div key={category._id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category._id}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {category.count}
                        </span>
                        <span className="text-xs text-gray-500">challenges</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2 bg-amber-500 rounded-2xl shadow-md shadow-amber-500/30">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Quick Actions
                </h3>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/roles/developers/admins/uploads')}
                  className="w-full text-left p-3 rounded-2xl border border-rose-100 bg-rose-50/80 transition duration-200 group hover:bg-rose-100/80 dark:border-rose-900/40 dark:bg-rose-900/20 dark:hover:bg-rose-900/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Challenge
                    </span>
                    <ChevronRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </button>
                
                <button
                  onClick={() => router.push('/roles/developers/admins/badges')}
                  className="w-full text-left p-3 rounded-2xl border border-amber-100 bg-amber-50/80 transition duration-200 group hover:bg-amber-100/80 dark:border-amber-900/40 dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assign Badge
                    </span>
                    <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </button>
                
                <button
                  onClick={() => router.push('/roles/developers/admins/badge-templates')}
                  className="w-full text-left p-3 rounded-2xl border border-purple-100 bg-purple-50/80 transition duration-200 group hover:bg-purple-100/80 dark:border-purple-900/40 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Manage Templates
                    </span>
                    <ChevronRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-white/60 p-6 shadow-lg dark:border-blue-900/40 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-slate-950/10">
              <div className="flex items-center space-x-3 mb-5">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  Admin Tips
                </h3>
              </div>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>• Regularly review and update challenge difficulty</p>
                <p>• Monitor badge assignment frequency</p>
                <p>• Keep badge templates organized by category</p>
                <p>• Set appropriate time limits for challenges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
