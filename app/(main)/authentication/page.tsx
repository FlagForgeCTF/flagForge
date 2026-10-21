"use client";
import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame, ShieldCheck, Sparkles, Orbit, ArrowRight, AlertCircle, Home as HomeIcon, X, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

const AuthPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams?.get("error");
  const callbackUrl = searchParams?.get("callbackUrl") || "/home";
  const [errorStatus, setErrorStatus] = useState<string | null>(errorParam);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  // If the user backs out of Google OAuth, the page may be restored from the
  // back/forward cache with the button still stuck on "Signing In..."
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setIsSigningIn(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const getErrorMessage = (errorType: string) => {
    switch (errorType) {
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return "Authentication protocol failed. Please try again.";
      case "OAuthAccountNotLinked":
        return "To confirm your identity, please sign in with the same account you used originally.";
      case "EmailSignin":
        return "The e-mail link is invalid or has expired.";
      case "CredentialsSignin":
        return "Identity verification failed. Check your credentials.";
      case "SessionRequired":
        return "Please sign in to access this secure zone.";
      default:
        return "An unexpected interference occurred. Access denied.";
    }
  };

  useEffect(() => {
    setErrorStatus(errorParam);
  }, [errorParam]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && !errorStatus) {
      router.replace(callbackUrl);
    }
  }, [sessionStatus, router, errorStatus, callbackUrl]);

  if (sessionStatus === "authenticated" && !errorStatus) {
    return null;
  }

  return (
    <div className="relative flex-1 min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-700">

      {/* Dynamic Handcrafted Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[30%] w-1 h-1 bg-red-500 rounded-full shadow-[0_0_100px_40px_rgba(239,68,68,0.1)]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">

        {/* Artistic Branding Section */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:max-w-xl">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold text-[11px] uppercase tracking-[0.2em]">
            <Orbit className="w-3.5 h-3.5 animate-spin-slow" />
            <span>START THE JOURNEY</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black text-gray-950 dark:text-white leading-[0.9] tracking-tighter">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500">FlagForge.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium tracking-tight leading-snug">
              The premier arena for cybersecurity <br className="hidden md:block" />
              mastery and elite challenges.
            </p>
          </div>

          <div className="hidden lg:flex flex-col sm:flex-row items-center gap-6 lg:pt-4">
            <div className="flex -space-x-3.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-11 h-11 rounded-2xl border-[3px] border-white dark:border-[#050505] bg-gray-100 dark:bg-gray-800 flex items-center justify-center rotate-3 first:rotate-0 last:-rotate-6 transition-transform hover:rotate-0 overflow-hidden shadow-sm">
                  <div className={`w-full h-full bg-gradient-to-br i-${i} ${i % 2 === 0 ? 'from-red-100 to-red-200' : 'from-orange-50 to-orange-100'}`} />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-black text-gray-400 dark:text-white-600 uppercase tracking-widest mb-0.5">Arena Status</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-300">1,000+ Seekers Active</span>
            </div>
          </div>
        </div>

        {/* The Crafted Login Identity */}
        <div className="w-full max-w-[440px] relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-red-500/20 via-transparent to-orange-500/10 blur-2xl opacity-50 pointer-events-none" />

          <div className="relative bg-white/40 dark:bg-white/[0.02] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.05)] flex flex-col group/card transition-shadow duration-500">

            {/* Header/Logo Section - Order 2 on Mobile, 1 on Desktop */}
            <div className="order-2 lg:order-1 flex flex-col items-center mb-10 lg:mb-12">
              <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_-5px_rgba(220,38,38,0.4)] transform hover:scale-110 hover:-rotate-6 transition-all duration-500">
                  <Flame className="w-10 h-10 lg:w-11 lg:h-11 text-white animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">Enter the Arena. <br />Your First Flag Awaits.</h2>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium">
                  Access your forge to continue <br /> your digital legacy.
                </p>
              </div>
            </div>

            {/* Premium Error Alert - Order 1 on Mobile, 2 on Desktop */}
            {errorStatus && (
              <div className="order-1 lg:order-2 w-full mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="relative group p-4 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 backdrop-blur-xl overflow-hidden animate-shake shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />

                  <div className="flex items-start gap-3 relative z-10">
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-500/20">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    </div>
                    <div className="flex-1 space-y-1 pr-6">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest italic opacity-80">System Interference Detected</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                        {getErrorMessage(errorStatus)}
                      </p>
                    </div>
                    <button
                      onClick={() => setErrorStatus(null)}
                      aria-label="Dismiss error"
                      className="absolute top-0 right-0 p-1 hover:bg-red-500/10 rounded-lg transition-colors group/btn focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-red-500/10"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Red Google Button - Order 3 */}
            <div className="order-3 flex flex-col gap-6">
              <button
                onClick={() => {
                  setIsSigningIn(true);
                  signIn("google");
                }}
                disabled={isSigningIn}
                className="relative w-full group isolate disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {/* Button Base - Red in both modes */}
                <div className="absolute inset-0 bg-red-600 rounded-2xl transition-all duration-500 group-hover:bg-red-500 group-hover:shadow-[0_10px_40px_rgba(220,38,38,0.4)]" />
                <div className="absolute inset-[1px] bg-red-600 rounded-[15px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative h-16 px-8 flex items-center transition-transform duration-300 group-hover:-translate-y-0.5 group-active:translate-y-0 text-white">
                  {/* Logo Container - Clean White Background for visibility */}
                  <div className="flex items-center justify-center bg-white p-2 rounded-xl shadow-md h-10 w-10 shrink-0 transform group-hover:scale-110 transition-transform">
                    <FcGoogle className="text-xl" />
                  </div>

                  {/* Centered Text Container - Perfectly Centered */}
                  <div className="flex-1 flex justify-center items-center">
                    <span className="font-extrabold text-lg tracking-tight whitespace-nowrap flex items-center gap-2">
                      {isSigningIn ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Signing In...</span>
                        </>
                      ) : (
                        "Sign in with Google"
                      )}
                    </span>
                  </div>

                  {/* Animated Arrow - Absolute to prevent block shift */}
                  {!isSigningIn && (
                    <div className="absolute right-4 transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <ArrowRight className="w-5 h-5 text-white/90" />
                    </div>
                  )}
                </div>
              </button>
              <Link
                href="/home"
                onClick={(e) => {
                  if (isSigningIn) {
                    e.preventDefault();
                  }
                }}
                aria-disabled={isSigningIn}
                tabIndex={isSigningIn ? -1 : 0}
                className="w-full group transition-opacity aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
              >
                <div className="relative h-12 flex items-center justify-center px-6 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl transition-all duration-300 group-hover:border-gray-300 dark:group-hover:border-white/20 group-hover:bg-gray-100 dark:group-hover:bg-white/10 group-hover:-translate-y-0.5 group-active:translate-y-0">
                  <HomeIcon className="w-4 h-4 mr-2.5 shrink-0" />
                  <span className="font-bold text-base tracking-tight whitespace-nowrap">
                    Return to Home
                  </span>
                </div>
              </Link>
            </div>

            <div className="order-4 mt-12 text-center space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] font-black text-gray-400 dark:text-white-500 uppercase tracking-[0.15em]">
                  <ShieldCheck className="w-3 h-3 text-red-500" />
                  <span><b>CAPTURE THE FLAG</b></span>
                </div>
              </div>

              <p className="text-[10px] leading-relaxed text-gray-400 dark:text-white-600 font-bold uppercase tracking-wider">
                <span className="mx-2 opacity-70">By signing up, you agree to our <br></br></span>
                <Link href="/privacy-policy" className="text-red-500/80 hover:text-red-500 hover:underline underline-offset-4 decoration-2 transition-colors inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                  <span className="sr-only">(opens in new tab)</span>
                </Link>
                <span className="mx-2 opacity-50">&</span>
                <Link href="/terms-of-service" className="text-red-500/80 hover:text-red-500 hover:underline underline-offset-4 decoration-2 transition-colors inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                  Terms & Conditions
                  <ExternalLink className="w-3 h-3" />
                  <span className="sr-only">(opens in new tab)</span>
                </Link>
              </p>
            </div>

          </div>

          {/* Mobile Seeker Stats Reordered Below Card */}
          <div className="flex lg:hidden flex-col items-center gap-6 mt-8">
            <div className="flex -space-x-3.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-11 h-11 rounded-2xl border-[3px] border-white dark:border-[#050505] bg-gray-100 dark:bg-gray-800 flex items-center justify-center rotate-3 first:rotate-0 last:-rotate-6 transition-transform hover:rotate-0 overflow-hidden shadow-sm">
                  <div className={`w-full h-full bg-gradient-to-br i-${i} ${i % 2 === 0 ? 'from-red-100 to-red-200' : 'from-orange-50 to-orange-100'}`} />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-400 dark:text-white-600 uppercase tracking-widest mb-0.5 text-center">Arena Status</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-300 text-center">1,000+ Seekers Active</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AuthPage;
