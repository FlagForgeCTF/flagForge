"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { landingFaqItems } from "@/lib/faq";

// Import images statically
import nirmalImage from "@/public/NirmalDahal.jpeg";
import sobitImage from "@/public/SobitThakuri.jpeg";
import bibekImage from "@/public/bibekghimire.jpeg"; 

import { Activity, Rocket, Target, Users, Layers, Clock, GraduationCap, BarChart2, Trophy, Lightbulb, Moon, Landmark, Smartphone } from "lucide-react";

const Hero: React.FC = () => {
  const { status } = useSession();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Icons for the stats section, mapped by index to preserve original data structure
  const statIcons = [Target, Users, Layers, Clock];

  const testimonials = [
    {
      id: 1,
      name: "Nirmal Dahal",
      position: "Cofounder of Cryptogen Nepal",
      image: nirmalImage,
      testimonial:
        "FlagForge provides an exceptional platform for cybersecurity professionals to validate their skills. The challenges mirror real-world attack vectors and help teams stay sharp in an ever-evolving threat landscape.",
    },
    {
      id: 2,
      name: "Sobit Thakuri",
      position: "Information Security Officer and ISO 27001:2022 Lead Auditor",
      image: sobitImage,
      testimonial:
        "I appreciate FlagForge's comprehensive approach to security training. The platform effectively bridges the gap between theoretical knowledge and practical application in cybersecurity.",
    },
    {
      id: 3,
      name: "Bibek Ghimire",
      position: "CTO of Bardali Creation",
      image: bibekImage,
      testimonial:
        "FlagForge is an engaging and fun CTF platform that helped me sharpen my cybersecurity and problem-solving skills in web exploitation and cryptography. A great place to learn, compete, and grow as a hacker!",
    },
  ];

  const categories = [
    {
      icon: "🌐",
      title: "Web Exploitation",
      description: "Master web vulnerabilities like SQL injection, XSS, CSRF, and more. Learn to identify and exploit common web application security flaws.",
    },
    {
      icon: "🔐",
      title: "Cryptography",
      description: "Decode encrypted messages, break ciphers, and understand cryptographic algorithms. From classical to modern encryption techniques.",
    },
    {
      icon: "🔍",
      title: "Reverse Engineering",
      description: "Analyze binaries, understand assembly code, and reverse engineer software to uncover hidden flags and vulnerabilities.",
    },
    {
      icon: "🕵️",
      title: "Forensics",
      description: "Investigate digital artifacts, analyze memory dumps, recover hidden data, and solve mysteries through digital forensics.",
    },
    {
      icon: "🎯",
      title: "Binary Exploitation",
      description: "Exploit buffer overflows, format string vulnerabilities, and other binary-level security issues in compiled programs.",
    },
    {
      icon: "🧩",
      title: "Miscellaneous",
      description: "Tackle unique challenges that don't fit traditional categories. Logic puzzles, OSINT, steganography, and creative problem-solving.",
    },
  ];

  const features = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Learn by Doing",
      description: "Hands-on challenges that teach real-world cybersecurity skills through practical application.",
    },
    {
      icon: <BarChart2 className="w-6 h-6" />,
      title: "Track Your Progress",
      description: "Monitor your improvement with detailed statistics, solve rates, and performance analytics.",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Compete & Rank",
      description: "Climb the leaderboard, earn points, and compete with cybersecurity enthusiasts worldwide.",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Smart Hint System",
      description: "Get unstuck with our intelligent hint system. Use points to unlock hints and keep solving.",
    },
    {
      icon: <Moon className="w-6 h-6" />,
      title: "Dark Mode Support",
      description: "Comfortable coding experience with full dark mode support for extended practice sessions.",
    },
    {
      icon: <Landmark className="w-6 h-6" />,
      title: "GRC Learning Hub",
      description: "Master Governance, Risk & Compliance from fundamentals to board-level frameworks — free, structured, and always available.",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Fully Responsive",
      description: "Practice anywhere, anytime. Our platform works seamlessly on desktop, tablet, and mobile devices.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Account",
      description: "Sign up for free and join our community of cybersecurity enthusiasts.",
    },
    {
      step: "2",
      title: "Choose Your Challenge",
      description: "Browse challenges across multiple categories and difficulty levels.",
    },
    {
      step: "3",
      title: "Solve & Submit",
      description: "Work through the challenge, find the flag, and submit your solution.",
    },
    {
      step: "4",
      title: "Earn Points & Rank Up",
      description: "Gain points for correct solutions and climb the global leaderboard.",
    },
  ];

  const stats = [
    { number: "100+", label: "Challenges" },
    { number: "1000+", label: "Active Users" },
    { number: "6", label: "Categories" },
    { number: "24/7", label: "Availability" },
  ];

  const changeTestimonial = (newIndex: number) => {
    if (newIndex === currentTestimonial || isAnimating) return;

    setIsAnimating(true);

    setTimeout(() => {
      setCurrentTestimonial(newIndex);
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 200);
  };

  const nextTestimonial = () => {
    const newIndex = (currentTestimonial + 1) % testimonials.length;
    changeTestimonial(newIndex);
  };

  const prevTestimonial = () => {
    const newIndex =
      (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    changeTestimonial(newIndex);
  };

  useEffect(() => {
    if (!isAutoPlaying || isAnimating) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentTestimonial, isAnimating]);

  const handleManualNavigation = (action: () => void) => {
    setIsAutoPlaying(false);
    action();
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-950 dark:text-white pb-20 relative overflow-hidden transition-colors duration-500">

      {/* Background Effects (Static) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-600/5 dark:bg-red-600/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-2%] w-[30%] h-[30%] bg-red-600/5 dark:bg-red-600/[0.03] rounded-full blur-[100px]" />
        {/* Volumetric Spotlight */}
        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-red-500/10 to-transparent rounded-full blur-[80px] opacity-40 mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.01] dark:opacity-[0.05] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 flex flex-col gap-16 lg:gap-24 pb-16">

        {/* Hero Section: Asymmetric Split */}
        <section className="max-w-7xl mx-auto w-full min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 content-center">
          {/* Left: Content */}
          <div className="space-y-8 text-center lg:text-left relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-[0.2em]">
              <Activity className="w-3.5 h-3.5" />
              <span>MIT College Partner Subdomain</span>
            </div>

            {/* Typography with fixed clipping */}
            <h1 className="relative text-4xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9] text-gray-900 dark:text-white z-10">
              WELCOME TO <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent italic pr-4 py-2 inline-block uppercase">
                MIT × FLAGFORGE
              </span> <br />
              <span className="text-gray-400 dark:text-gray-600 text-2xl lg:text-4xl block mt-2">
                MIT CTF PLAYGROUND
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 relative z-10">
              <span className="text-red-500 font-black">FlagForge</span> is a dynamic platform for{" "}
              <span className="text-gray-900 dark:text-white font-bold italic">Cybersecurity</span> excellence
              hosted in partnership with Model Institute of Technology (MIT College).
              Sharpen your skills in cryptography, web exploitation, reverse engineering, and more.
            </p>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 max-w-xl mx-auto lg:mx-0 backdrop-blur-sm relative z-10 animate-pulse">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-red-500" />
                <div className="text-xs text-left text-gray-700 dark:text-gray-300 font-medium">
                  Official Cybersecurity Playground for <span className="font-bold text-red-500">Model Institute of Technology (MIT)</span>.
                  Learn more about our <Link href="/about" className="underline hover:text-red-500 font-bold transition-colors">Academic Partnership</Link>.
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-start pt-4 relative z-10">
              <Link
                href={status === "authenticated" ? "/problems" : "/authentication"}
                className="group relative px-10 py-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 transition-all flex items-center gap-4 overflow-hidden"
              >
                <span>Start Solving</span>
                <Rocket className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right: Clean Connected Stats Grid (Reference Style) */}
          <div className="relative w-full flex items-center justify-center py-10">
            <div className="relative grid grid-cols-2 gap-6 w-full max-w-lg shadow-[0_0_100px_-20px_rgba(220,38,38,0.1)] rounded-[3rem] p-4">

              {/* Central Connector Lines */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 z-0 opacity-20">
                <div className="absolute inset-0 border-t border-l border-red-500 rotate-45 scale-125" />
                <div className="absolute inset-0 border-b border-r border-red-500 rotate-45 scale-125" />
              </div>

              {stats.map((stat, index) => {
                const Icon = statIcons[index];
                // Determine corner badge position based on index
                // 0: top-left (badge bottom-right), 1: top-right (badge bottom-left)
                // 2: bottom-left (badge top-right), 3: bottom-right (badge top-left)
                const badgePosition =
                  index === 0 ? "bottom-[-6px] right-[-6px]" :
                    index === 1 ? "bottom-[-6px] left-[-6px]" :
                      index === 2 ? "top-[-6px] right-[-6px]" :
                        "top-[-6px] left-[-6px]";

                return (
                  <div key={index} className="relative bg-white dark:bg-[#050505] p-8 rounded-[2rem] shadow-xl flex flex-col items-center justify-center gap-4 z-10 hover:scale-[1.02] transition-transform duration-300">
                    {/* Inner Corner Connection Dot */}
                    <div className={`absolute ${badgePosition} w-3 h-3 rounded-full bg-red-100 dark:bg-[#050505] border-2 border-red-500 z-20`} />

                    <Icon className="w-10 h-10 text-red-500 stroke-[1.5]" />
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{stat.number}</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section: Bento Grid */}
        <section className="max-w-7xl mx-auto w-full space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white mb-4">
                Why Choose <span className="text-red-500">FlagForge</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Everything you need to master cybersecurity through hands-on practice
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-3xl p-8 hover:border-red-500/30 transition-colors ${index === 0 || index === 3 || index === 4 ? "md:col-span-2" : "md:col-span-1"
                  }`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="text-9xl font-black">{index + 1}</div>
                </div>
                <div className="h-full flex flex-col justify-between relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-2xl mb-6 shadow-sm">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Challenge Categories: Hover Cards */}
        <section className="max-w-7xl mx-auto w-full space-y-16">
          <div className="text-left border-l-4 border-red-500 pl-6">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white mb-2">
              Challenge <span className="block text-red-500">Categories</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group relative h-64 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300"
              >
                <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center transition-all duration-300 group-hover:-translate-y-full opacity-100 group-hover:opacity-0">
                  <div className="text-6xl mb-6 grayscale group-hover:grayscale-0 transition-all">{category.icon}</div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                </div>

                <div className="absolute inset-0 p-8 bg-red-600 flex flex-col items-center justify-center text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-black uppercase tracking-widest text-white mb-4">
                    {category.title}
                  </h3>
                  <p className="text-white/90 text-sm font-medium leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works: Horizontal Circuit Flow */}
        <section className="max-w-7xl mx-auto w-full space-y-16">
          <div className="text-center">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
              How It <span className="text-red-500">Works</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto mt-4">
              Get started in just four simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[2rem] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {howItWorks.map((item, index) => (
                <div key={index} className="group relative flex flex-col items-center text-center">
                  {/* Step Node */}
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#050505] border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center text-2xl font-black text-red-500 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>

                  {/* Content Card */}
                  <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full h-full hover:border-red-500/30 transition-all hover:-translate-y-2">
                    <h3 className="text-lg font-black tracking-tight uppercase text-gray-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Connecting Line (Mobile Vertical) */}
                  {index !== howItWorks.length - 1 && (
                    <div className="md:hidden absolute bottom-[-2rem] left-1/2 w-0.5 h-8 bg-red-500/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Testimonial Carousel */}
        <section className="w-full max-w-7xl mx-auto" aria-labelledby="testimonials-title">
          <div className="text-center mb-16 space-y-4">
            <h2 id="testimonials-title" className="text-3xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
              Expert <span className="text-red-500">Vouches</span>
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div
              className={`relative overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl transition-all duration-700 ease-in-out ${isAnimating ? "opacity-40 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"}`}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.03] rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-red-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                  <Image
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    width={160}
                    height={160}
                    className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white dark:border-white/5"
                  />
                </div>

                <div className="flex-1 text-center md:text-left space-y-6">
                  <blockquote className="text-lg lg:text-xl font-medium italic text-gray-700 dark:text-gray-300 leading-tight">
                    "{testimonials[currentTestimonial].testimonial}"
                  </blockquote>
                  <div className="space-y-1">
                    <div className="text-xl font-black tracking-tighter uppercase text-red-500">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-sm font-black uppercase tracking-widest text-gray-400">
                      {testimonials[currentTestimonial].position}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center mt-8 gap-4">
              <button
                onClick={() => handleManualNavigation(prevTestimonial)}
                disabled={isAnimating}
                className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button
                onClick={() => handleManualNavigation(nextTestimonial)}
                disabled={isAnimating}
                className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </section>

        {/* CTA: Minimalist */}
        <section className="max-w-4xl mx-auto w-full text-center py-20">
          <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white mb-8">
            Ready to <span className="text-red-500">Hack?</span>
          </h2>
          <div className="flex justify-center">
            <Link
              href={status === "authenticated" ? "/problems" : "/authentication"}
              className="group relative px-16 py-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-lg font-black uppercase tracking-[0.25em] transition-transform hover:scale-105"
            >
              <span>Get Started Now</span>
            </Link>
          </div>
        </section>

        {/* FAQ: Split Layout */}
        <section className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
          {/* Sticky Header */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32">
              <h2 className="text-3xl lg:text-6xl font-black tracking-tighter uppercase text-gray-900 dark:text-white mb-6">
                FAQ<span className="text-red-500">S</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                Common questions about the platform, challenges, and community.
              </p>
            </div>
          </div>

          {/* Accordion List */}
          <div className="lg:col-span-2 space-y-4">
            {landingFaqItems.map((faq, index) => (
              <div
                key={index}
                className="group border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-white/10"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <div className={`w-6 h-6 flex items-center justify-center transition-transform duration-300 ${openFaqIndex === index ? "rotate-180 text-red-500" : "text-gray-400"}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${openFaqIndex === index ? "max-h-[500px]" : "max-h-0"}`}
                >
                  <div className="px-8 pb-8 text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Hero;
