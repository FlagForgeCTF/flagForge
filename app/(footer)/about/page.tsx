import Link from "next/link";
import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import {
  Info,
  ShieldAlert,
  Terminal,
  Target,
  Rocket,
  Users,
  Lock,
  Globe,
  Zap,
  Scale,
  CheckCircle2,
  BookOpen,
  Cpu,
  Network,
  Binary,
  Search,
  Puzzle,
  TrendingUp,
  Heart,
  ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "About FlagForge | CTF Platform for Cybersecurity Learning",
  description: "FlagForge is a dynamic CTF platform promoting cybersecurity awareness and hands-on coding challenges. Join our global community of learners.",
  keywords: [
    "CTF",
    "cybersecurity",
    "capture the flag",
    "coding challenges",
    "hacking",
    "security learning",
    "FlagForge",
    "Nepal cybersecurity community",
  ],
  authors: [{ name: "FlagForge Team" }],
  openGraph: {
    title: "About FlagForge | CTF Platform",
    description: "Where curiosity meets cybersecurity. Learn, compete, and grow with our global community.",
    type: "website",
    siteName: "FlagForge",
    url: "https://flagforgectf.com/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About FlagForge | CTF Platform",
    description: "Where curiosity meets cybersecurity. Learn, compete, and grow with our global community.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://flagforgectf.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About",
        "item": "https://flagforgectf.com/about"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-950 dark:text-white pb-20 relative overflow-hidden transition-colors duration-500">
      <JsonLd data={breadcrumbData} />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-600/5 dark:bg-red-600/[0.03] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-2%] w-[30%] h-[30%] bg-red-600/5 dark:bg-red-600/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />
      </div>

      <div className="relative z-10 w-[92%] lg:w-[75%] max-w-5xl mx-auto pt-28 lg:pt-36">

        {/* Header Section */}
        <div className="flex flex-col items-center gap-6 mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-[0.2em]">
            <Info className="w-3.5 h-3.5" />
            <span>Platform Info</span>
          </div>
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-gray-900 dark:text-white">
              About <span className="text-red-400 dark:text-red-500">FlagForge</span>
            </h1>
            <h2 className="text-md text-gray-500 dark:text-gray-400 italic font-medium tracking-wide uppercase">
              "Where curiosity meets cybersecurity."
            </h2>
            <p className="text-lg lg:text-xl font-medium text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              FlagForge is a dynamic and engaging CTF platform dedicated to promoting{" "}
              <span className="text-red-500 dark:text-red-500 font-black">
                Cybersecurity
              </span>{" "}
              awareness and fostering a passion for coding among participants.
            </p>
          </div>
        </div>

        {/* Main Content Dashboard */}
        <div className="space-y-10 lg:space-y-16">

          {/* Platform & Features Card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-red-600/5 to-orange-500/5 blur-3xl opacity-50 pointer-events-none" />
            <div className="relative bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-14 shadow-2xl">
              <div className="grid lg:grid-cols-[1fr_0.8fr] gap-12 lg:gap-16 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-red-500">
                      <Zap className="w-6 h-6" />
                      <h2 className="text-2xl font-black tracking-tighter uppercase dark:text-white">Our Platform</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                      Our platform features a clean, responsive interface and an easy-to-use
                      experience. Flags are securely submitted and efficiently validated for
                      fair play. Participants can track scores on a real-time leaderboard.
                      With Google Authentication, users can sign in instantly and start
                      solving. Challenges can be filtered by category and difficulty,
                      helping participants find content that fits their skills and interests.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-red-500">
                        <Target className="w-5 h-5" />
                        <h4 className="text-lg font-black tracking-tighter uppercase dark:text-white text-sm">Our Mission</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        To make cybersecurity learning accessible and engaging through practical
                        challenges, collaboration, and gamified experiences that empower learners
                        worldwide.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-red-500">
                        <Rocket className="w-5 h-5" />
                        <h4 className="text-lg font-black tracking-tighter uppercase dark:text-white text-sm">Our Vision</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        To build a global community where future cybersecurity experts and developers
                        learn, compete, and grow together.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Lock, title: "Secure", desc: "End-to-end encrypted communication" },
                    { icon: Users, title: "Collaborative", desc: "Direct participant-organizer communication" },
                    { icon: Globe, title: "Global", desc: "Worldwide network of participants" },
                    { icon: ShieldAlert, title: "Private", desc: "Responsible disclosure practices" },
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="group/item relative overflow-hidden bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl p-6 transition-all hover:bg-white dark:hover:bg-white/5 hover:border-red-500/30"
                    >
                      <div className="absolute top-0 left-0 w-1 h-0 bg-red-500 group-hover/item:h-full transition-all duration-300" />
                      <feature.icon className="w-6 h-6 text-red-500 mb-4 group-hover/item:scale-110 transition-transform" />
                      <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-medium">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Partner Card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-600/5 to-red-600/5 blur-3xl opacity-50 pointer-events-none" />
            <div className="relative bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-14 shadow-2xl">
              <div className="grid lg:grid-cols-[1fr_0.8fr] gap-12 lg:gap-16 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-red-500">
                      <BookOpen className="w-6 h-6" />
                      <h2 className="text-2xl font-black tracking-tighter uppercase dark:text-white">Academic Partnership</h2>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      Model Institute of Technology (MIT College)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                      FlagForge is proud to collaborate with <span className="text-red-500 dark:text-red-500 font-bold">Model Institute of Technology (MIT)</span> to host a dedicated cyber security playground. Located in Kamaladi, Kathmandu, MIT College stands as one of the best American Degree Colleges in Nepal. In partnership with the <span className="text-gray-900 dark:text-white font-bold">International American University (IAU), USA</span>, MIT delivers world-class education with flexible pathways and seamless credit transfer opportunities.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                      Through this dedicated CTF subdomain, students of Bachelor of Information Technology (BIT) and related programs gain practical, hands-on exposure to defensive and offensive cybersecurity techniques, aligning classroom learning with industry-recognized security skills.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-red-500">
                        <Cpu className="w-5 h-5" />
                        <h4 className="text-lg font-black tracking-tighter uppercase dark:text-white text-sm">Key Programs</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>Bachelor of Information Technology (BIT)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>Bachelor of Business Administration (BBA)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>Master of Business Administration (MBA)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-red-500">
                        <Target className="w-5 h-5" />
                        <h4 className="text-lg font-black tracking-tighter uppercase dark:text-white text-sm">IAU USA Affiliation</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        Earn an internationally recognized American degree in Nepal. Benefit from seamless credit transfers to IAU and access top U.S. universities, saving both time and educational costs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 justify-center p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl">
                  <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-2 text-center lg:text-left">
                    College Contact & Details
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-500 mt-0.5">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase font-black">Website</div>
                        <Link href="https://mitnepal.edu.np" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
                          mitnepal.edu.np
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-500 mt-0.5">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase font-black">Location</div>
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          Kamaladi, Kathmandu, Nepal
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-500 mt-0.5">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase font-black">Admissions Info</div>
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          01-5901393, 01-5901394
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-500 mt-0.5">
                        <Info className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase font-black">Inquiries</div>
                        <Link href="mailto:info@mitnepal.edu.np" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
                          info@mitnepal.edu.np
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <Link
                      href="https://mitnepal.edu.np/about"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/15 animate-pulse"
                    >
                      <span>Explore MIT Nepal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ethical Hacking Disclosure Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[2rem] blur opacity-25" />
            <div className="relative bg-amber-50/80 dark:bg-amber-950/20 backdrop-blur-3xl border border-amber-200/50 dark:border-amber-900/40 rounded-[2rem] p-8 lg:p-12 overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row gap-10 items-start">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                  <Scale className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-amber-900 dark:text-amber-400">
                    Educational Purpose & Ethical Hacking
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    <p>
                      <span className="text-amber-700 dark:text-amber-500 font-black">FlagForge is designed exclusively for educational purposes.</span> Our platform provides a safe, legal, and controlled environment for learning cybersecurity concepts, ethical hacking techniques, and problem-solving skills.
                    </p>
                    <p>
                      All challenges and activities on FlagForge are intended to teach responsible security practices. We strictly prohibit the use of knowledge gained on our platform for any illegal activities, unauthorized access to systems, or malicious purposes.
                    </p>
                    <p>
                      By participating in FlagForge challenges, users agree to:
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-4 pt-2">
                      {[
                        "Use their skills only for legal and ethical purposes",
                        "Respect the privacy and security of others",
                        "Follow responsible disclosure practices",
                        "Comply with all applicable laws and regulations",
                        "Never attack systems outside our platform"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 bg-white/50 dark:bg-white/[0.02] p-3 rounded-xl border border-amber-600/10 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-amber-600/5 dark:bg-amber-500/5 border-l-4 border-amber-500 p-4 mt-6 italic text-amber-900 dark:text-amber-200">
                      We promote ethical hacking and responsible security research. If you discover a security vulnerability in any system, please follow responsible disclosure practices and report it to the appropriate parties.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Categories Grid */}
          <div className="space-y-10">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black tracking-tighter uppercase dark:text-white">
                What You'll <span className="text-red-500">Learn</span>
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Comprehensive cybersecurity skills development</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Web Security",
                  icon: Globe,
                  skills: ["XSS Prevention", "SQL Injection Defense", "CSRF Protection", "Secure Authentication"]
                },
                {
                  title: "Cryptography",
                  icon: Lock,
                  skills: ["Encryption Basics", "Hash Functions", "Digital Signatures", "Secure Communication"]
                },
                {
                  title: "Network Security",
                  icon: Network,
                  skills: ["Protocol Analysis", "Packet Inspection", "Firewall Configuration", "Intrusion Detection"]
                },
                {
                  title: "Reverse Engineering",
                  icon: Binary,
                  skills: ["Binary Analysis", "Debugging Techniques", "Code Decompilation", "Malware Analysis"]
                },
                {
                  title: "Forensics",
                  icon: Search,
                  skills: ["Data Recovery", "Log Analysis", "Memory Forensics", "Evidence Collection"]
                },
                {
                  title: "Problem Solving",
                  icon: Puzzle,
                  skills: ["Critical Thinking", "Pattern Recognition", "Logical Reasoning", "Creative Solutions"]
                }
              ].map((category, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden bg-white/80 dark:bg-white/[0.02] backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 transition-all hover:-translate-y-1 hover:border-red-500/40 shadow-sm hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                  <category.icon className="w-10 h-10 text-red-500 mb-6" />
                  <h4 className="text-xl font-black tracking-tighter uppercase dark:text-white mb-4">
                    {category.title}
                  </h4>
                  <ul className="space-y-3">
                    {category.skills.map((skill, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium group/skill">
                        <Terminal className="w-3 h-3 text-red-400 group-hover/skill:translate-x-1 transition-transform" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Stats & Community Card */}
          <div className="relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-700 opacity-90 transition-opacity" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.1]" />
            <div className="relative p-10 lg:p-16 text-white flex flex-col items-center text-center space-y-10">
              <div className="space-y-4">
                <h3 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-[0.9]">Join Our Growing Community</h3>
                <p className="text-lg lg:text-xl font-medium opacity-90 max-w-3xl leading-relaxed">
                  Built by passionate developers and cybersecurity enthusiasts, FlagForge is more than just a platform—it's a community dedicated to helping others learn, grow, and forge their own path in technology and cybersecurity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 w-full pt-4">
                {[
                  { label: "Active Users", value: "1000+", icon: Users },
                  { label: "Challenges Solved", value: "500+", icon: TrendingUp },
                  { label: "Learning Support", value: "24/7", icon: Heart }
                ].map((stat, i) => (
                  <div key={i} className="space-y-4 group/stat">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto border border-white/20 group-hover/stat:rotate-[12deg] transition-transform">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-5xl font-black tracking-tighter">{stat.value}</div>
                      <div className="text-sm font-black uppercase tracking-widest opacity-70">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col items-center gap-6 py-10 lg:py-14 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <Link
              href="/problems"
              className="group relative px-12 py-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-black uppercase tracking-[0.25em] shadow-2xl shadow-red-600/30 transition-all flex items-center justify-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span>Start Solving Challenges</span>
              <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-red-500" /> Free to join
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-red-500" /> No credit card required
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-red-500" /> Start learning immediately
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
