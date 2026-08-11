"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/public/flagforge-logo.png";
import { CgMenuRightAlt } from "react-icons/cg";
import { NavbarData } from "@/utils/data";
import { NavbarItems } from "@/interfaces";
import { useSession } from "next-auth/react";
import { signOut } from "@/utils/auth";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";
import {
  Home,
  Terminal,
  Trophy,
  BookText,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  LayoutDashboard,
  ArrowRight,
  Archive
} from "lucide-react";

const NavItem = ({ href, tags, onClick, style }: NavbarItems) => {
  const isExternal = href.startsWith('http');

  return (
    <li onClick={onClick}>
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={cn(
          "block w-full rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 font-medium touch-manipulation active:scale-95",
          style
        )}
      >
        {tags}
      </Link>
    </li>
  );
};

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const [standing, setStanding] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const pendingCloseRef = React.useRef(false);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMobileItemClick = () => {
    pendingCloseRef.current = true;
  };

  const handleMobileSignOut = async () => {
    handleMobileItemClick();
    await signOut();
  };

  const handleSheetOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      pendingCloseRef.current = false;
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    }
  };

  React.useEffect(() => {
    if (!pendingCloseRef.current) return;
    pendingCloseRef.current = false;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 200);
  }, [pathname]);

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (session.status !== "authenticated") {
      setStanding("");
      setIsAdmin(false);
      return;
    }

    let active = true;
    const loadUserData = async () => {
      try {
        // Load user profile data
        const profileResponse = await fetch("/api/profile");
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          const rankValue = typeof data?.rank === "number" ? data.rank : null;
          const level = typeof data?.level === "string" ? data.level : "";
          const match = level.match(/\[[^\]]+\]\[([^\]]+)\]/);
          const label = match?.[1] || level || "";
          const nextStanding = rankValue ? `Rank #${rankValue}` : label;
          if (active) setStanding(nextStanding);
        }

        // Load user role data
        const roleResponse = await fetch("/api/user/role");
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          if (active) setIsAdmin(roleData.isAdmin || false);
        }
      } catch (error) {
        if (active) {
          setStanding("");
          setIsAdmin(false);
        }
      }
    };

    loadUserData();
    return () => {
      active = false;
    };
  }, [session.status]);

  return (
    <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 w-full transition-all duration-500">
      <nav className="flex justify-between items-center w-[92%] lg:w-[80%] mx-auto h-16 md:h-20 transition-all duration-300">
        <Link href="/" className="group outline-none">
          <div className="flex items-center gap-3 transition-transform duration-300 group-hover:scale-[1.02] active:scale-95">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src={logo}
                alt="logo"
                height={40}
                width={40}
                className="relative h-8 w-8 md:h-10 md:w-10 object-contain"
              />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors flex items-center">
              FlagForge
              <span className="text-[10px] ml-2 font-black text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded-md bg-red-500/5 uppercase tracking-wider">
                MIT
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          <ul className="flex items-center gap-1 lg:gap-2">
            {/* Show navigation based on authentication status */}
            {NavbarData
              .filter(item => session.status === "authenticated" || item.tags !== "Home")
              .map(({ href, tags }: NavbarItems) => (
                <NavItem
                  key={href}
                  href={href}
                  tags={tags}
                  style="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
                />
              ))}
          </ul>

          <div className="flex items-center gap-4 lg:gap-6 ml-4 pl-4 border-l border-gray-100 dark:border-white/10">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 active:scale-90"
              aria-label="Toggle dark mode"
            >
              <div className="relative h-5 w-5">
                <SunIcon
                  className={cn(
                    "absolute h-full w-full transition-all duration-300",
                    theme === "dark"
                      ? "rotate-0 scale-100"
                      : "-rotate-90 scale-0"
                  )}
                />
                <MoonIcon
                  className={cn(
                    "absolute h-full w-full transition-all duration-300",
                    theme === "dark"
                      ? "rotate-90 scale-0"
                      : "rotate-0 scale-100"
                  )}
                />
              </div>
            </button>

            {session.status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="group flex items-center gap-3 p-1.5 pr-4 rounded-full bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 hover:-translate-y-0.5">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white dark:border-gray-800 shadow-sm ring-1 ring-red-500/10 group-hover:ring-red-500/30 transition-all">
                      <Image
                        src={session.data?.user?.image ?? logo}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start leading-none shrink-0 group">
                      <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">
                        {session.data?.user?.name ?? "Arena User"}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                        {standing}
                      </span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-3 w-56 p-2 rounded-2xl border-gray-100 dark:border-white/5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200" align="end">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-gray-400">Account Control</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5 my-1" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all cursor-pointer">
                      Profile Workspace
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/home" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all cursor-pointer">
                      Main Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/roles/developers/admins" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-500 transition-all cursor-pointer">
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5 my-1" />
                  <DropdownMenuItem
                    onClick={async () => await signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 rounded-xl hover:bg-red-500 dark:hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/authentication"
                className="group relative inline-flex items-center justify-center px-8 py-3.5 font-bold text-white transition-all duration-300 ease-in-out"
              >
                <div className="absolute inset-0 bg-red-600 rounded-2xl shadow-[0_10px_20px_-5px_rgba(220,38,38,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_15px_30px_-5px_rgba(220,38,38,0.4)] active:scale-95" />
                <span className="relative z-10 text-sm md:text-base tracking-tight">Sign in</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 active:scale-90"
            aria-label="Toggle dark mode"
          >
            <div className="relative h-6 w-6">
              <SunIcon
                className={cn(
                  "absolute h-full w-full transition-all duration-300",
                  theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                )}
              />
              <MoonIcon
                className={cn(
                  "absolute h-full w-full transition-all duration-300",
                  theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
                )}
              />
            </div>
          </button>

          <Sheet open={open} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
              <button
                aria-label="Open navigation menu"
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 active:scale-90 transition-all"
              >
                <CgMenuRightAlt className="text-3xl text-gray-900 dark:text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] border-none p-0 bg-white dark:bg-gray-950">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Access site navigation links, user profile, and session controls.
              </SheetDescription>
              <div className="flex flex-col h-full">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <Image src={logo} alt="logo" height={40} width={40} />
                  <span className="text-2xl font-black text-gray-950 dark:text-white tracking-tighter flex items-center">
                    FlagForge
                    <span className="text-xs ml-2 font-black text-red-500 border border-red-500/30 px-2 py-0.5 rounded-md bg-red-500/5 uppercase tracking-wider">
                      MIT
                    </span>
                  </span>
                </div>

                <nav className="flex-1 p-6">
                  <ul className="space-y-4">
                    {/* Show navigation based on authentication status */}
                    {NavbarData
                      .filter(item => session.status === "authenticated" || item.tags !== "Home")
                      .map(({ href, tags }: NavbarItems) => {
                        const getIcon = (tag: string) => {
                          switch (tag.toLowerCase()) {
                            case "home": return <Home className="w-5 h-5" />;
                            case "problems": return <Terminal className="w-5 h-5" />;
                            case "leaderboard": return <Trophy className="w-5 h-5" />;
                            case "archives": return <Archive className="w-5 h-5" />;
                            case "learn grc": return <BookText className="w-5 h-5" />;
                            case "blogs": return <BookText className="w-5 h-5" />;
                            default: return <Terminal className="w-5 h-5" />;
                          }
                        };
                        const isExternal = href.startsWith('http');
                        return (
                          <li key={href}>
                            <Link
                              href={href}
                              target={isExternal ? "_blank" : undefined}
                              rel={isExternal ? "noopener noreferrer" : undefined}
                              onClick={handleMobileItemClick}
                              className="flex items-center gap-4 px-6 py-4 text-lg font-bold text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all border border-transparent hover:border-red-500/10"
                            >
                              <span className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
                                {getIcon(tags)}
                              </span>
                              {tags}
                            </Link>
                          </li>
                        );
                      })}

                    {/* Show sign in/up button for unauthenticated users */}
                    {session.status === "unauthenticated" && (
                      <li className="pt-6">
                        <Link
                          href="/authentication"
                          onClick={handleMobileItemClick}
                          className="group relative flex items-center justify-center w-full py-5 overflow-hidden rounded-2xl transition-all active:scale-[0.98]"
                        >
                          <div className="absolute inset-0 bg-red-600 transition-transform group-hover:scale-105" />
                          <div className="relative flex items-center gap-3 font-black text-lg text-white">
                            <LogIn className="w-6 h-6" />
                            <span>Sign in</span>
                          </div>
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>

                {session.status === "authenticated" && (
                  <div className="p-8 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-red-500/20 blur-md rounded-2xl" />
                        <Image src={session.data?.user?.image ?? logo} alt="P" height={56} width={56} className="relative rounded-2xl border-2 border-white dark:border-gray-800 object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-950" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-950 dark:text-white truncate">
                          {session.data?.user?.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {session.data?.user?.email}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400 dark:text-gray-500">
                          {standing}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Link
                        href="/profile"
                        onClick={handleMobileItemClick}
                        className="flex items-center justify-between w-full p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-red-500/20 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <LayoutDashboard className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Workspace</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-all" />
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/roles/developers/admins"
                          onClick={handleMobileItemClick}
                          className="flex items-center justify-between w-full p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 hover:border-orange-500/20 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-orange-500 group-hover:text-orange-600 transition-colors" />
                            <span className="text-sm font-bold text-orange-700 dark:text-orange-300">Admin Dashboard</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                      )}

                      <button
                        onClick={handleMobileSignOut}
                        className="flex items-center justify-center gap-3 w-full py-4 text-sm font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-500/10 border-2 border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all group"
                      >
                        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        Terminate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
