"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
    Flag,
    Target,
    Search,
    Code,
    Lock,
    Unlock,
    Trophy,
    Lightbulb,
    BookOpen,
    CheckCircle,
    ArrowRight,
    Zap,
    Shield,
    Eye,
    Terminal,
    FileSearch,
    Brain,
    Puzzle,
} from "lucide-react";


const OnboardingGuide: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"overview" | "categories" | "howto" | "example">("overview");

    const categories = [
        {
            icon: <Code className="h-8 w-8" />,
            title: "Web Exploitation",
            color: "red",
            description: "Exploit web application vulnerabilities like SQL injection, XSS, CSRF, and more.",
            skills: ["SQL Injection", "Cross-Site Scripting", "Authentication Bypass", "Server-Side Attacks"],
        },
        {
            icon: <Lock className="h-8 w-8" />,
            title: "Cryptography",
            color: "purple",
            description: "Break encryption, decode ciphers, and understand cryptographic algorithms.",
            skills: ["Classical Ciphers", "Modern Encryption", "Hash Functions", "RSA & Public Key"],
        },
        {
            icon: <FileSearch className="h-8 w-8" />,
            title: "Forensics",
            color: "green",
            description: "Investigate digital artifacts, analyze files, and recover hidden data.",
            skills: ["File Analysis", "Memory Forensics", "Network Analysis", "Steganography"],
        },
        {
            icon: <Terminal className="h-8 w-8" />,
            title: "Reverse Engineering",
            color: "blue",
            description: "Analyze binaries, understand assembly code, and reverse engineer software.",
            skills: ["Binary Analysis", "Assembly Language", "Debugging", "Decompilation"],
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: "Binary Exploitation (PWN)",
            color: "orange",
            description: "Exploit buffer overflows, format strings, and binary-level vulnerabilities.",
            skills: ["Buffer Overflow", "ROP Chains", "Shellcode", "Memory Corruption"],
        },
        {
            icon: <Puzzle className="h-8 w-8" />,
            title: "Miscellaneous",
            color: "cyan",
            description: "Unique challenges including OSINT, logic puzzles, and creative problem-solving.",
            skills: ["OSINT", "Logic Puzzles", "Trivia", "Creative Thinking"],
        },
    ];

    const solvingSteps = [
        {
            step: 1,
            title: "Read the Challenge",
            icon: <BookOpen className="h-6 w-6" />,
            description: "Carefully read the challenge description, title, and any provided hints. Every word matters!",
            tips: ["Note the challenge category", "Look for keywords", "Check attached files"],
        },
        {
            step: 2,
            title: "Reconnaissance",
            icon: <Search className="h-6 w-6" />,
            description: "Gather information about the target. Explore, enumerate, and understand what you're dealing with.",
            tips: ["Inspect source code", "Use developer tools", "Check network requests", "Enumerate directories"],
        },
        {
            step: 3,
            title: "Analyze & Identify",
            icon: <Brain className="h-6 w-6" />,
            description: "Identify potential vulnerabilities or patterns. Think about what the challenge is testing.",
            tips: ["Look for common vulnerabilities", "Test inputs", "Check for edge cases"],
        },
        {
            step: 4,
            title: "Exploit & Solve",
            icon: <Target className="h-6 w-6" />,
            description: "Execute your attack or solution. Use the right tools and techniques for the job.",
            tips: ["Use appropriate tools", "Document your process", "Try different approaches"],
        },
        {
            step: 5,
            title: "Capture the Flag",
            icon: <Flag className="h-6 w-6" />,
            description: "Find the flag (usually in format: flag{...} or FLAG{...}) and submit it!",
            tips: ["Flags are case-sensitive", "Copy exactly as shown", "Verify before submitting"],
        },
    ];

    const exampleWalkthrough = {
        title: "Example: Scavenger Hunt Challenge",
        category: "Web Exploitation",
        difficulty: "Beginner",
        points: 100,
        steps: [
            {
                title: "Initial Observation",
                content: "You're presented with a simple web page. The challenge hints at 'hidden treasures' on the website.",
                action: "Open the website and inspect it visually.",
            },
            {
                title: "View Page Source",
                content: "Right-click on the page and select 'View Page Source' or press Ctrl+U (Cmd+Option+U on Mac).",
                action: "Look through the HTML source code for comments or hidden elements.",
                discovery: "Found an HTML comment: <!-- Check the robots.txt file -->",
            },
            {
                title: "Check robots.txt",
                content: "Navigate to /robots.txt - a file that tells search engines which pages to crawl.",
                action: "Visit https://example.com/robots.txt",
                discovery: "Found a disallowed path: /secret-directory/",
            },
            {
                title: "Explore Hidden Directory",
                content: "Visit the secret directory found in robots.txt.",
                action: "Navigate to https://example.com/secret-directory/",
                discovery: "Found a page with encoded text: ZmxhZ3toaWRkZW5faW5fcGxhaW5fc2lnaHR9",
            },
            {
                title: "Decode the Flag",
                content: "The string looks like Base64 encoding (ends with =, uses A-Z, a-z, 0-9, +, /).",
                action: "Decode using: echo 'ZmxhZ3toaWRkZW5faW5fcGxhaW5fc2lnaHR9' | base64 -d",
                discovery: "Decoded flag: flag{hidden_in_plain_sight}",
            },
            {
                title: "Submit the Flag",
                content: "Copy the flag exactly as it appears and submit it in the challenge submission box.",
                action: "Submit: flag{hidden_in_plain_sight}",
                result: "✅ Challenge Solved! +100 Points",
            },
        ],
    };

    const tips = [
        {
            icon: <Lightbulb className="h-5 w-5" />,
            title: "Start Simple",
            description: "Begin with easier challenges to build confidence and learn the basics.",
        },
        {
            icon: <BookOpen className="h-5 w-5" />,
            title: "Learn Continuously",
            description: "Every challenge teaches something new. Read writeups after solving to learn alternative methods.",
        },
        {
            icon: <Target className="h-5 w-5" />,
            title: "Use Hints Wisely",
            description: "Stuck? Use our hint system! Watch an ad or spend points to get guidance.",
        },
        {
            icon: <Shield className="h-5 w-5" />,
            title: "Practice Ethically",
            description: "Only use these skills on authorized systems. FlagForge provides a safe, legal environment.",
        },
        {
            icon: <Trophy className="h-5 w-5" />,
            title: "Compete & Collaborate",
            description: "Check the leaderboard, but also learn from the community. Collaboration makes everyone better.",
        },
        {
            icon: <Eye className="h-5 w-5" />,
            title: "Think Like an Attacker",
            description: "Question everything. What could go wrong? What wasn't validated? Where's the weak point?",
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
            red: {
                bg: "bg-red-50 dark:bg-red-900/20",
                text: "text-red-600 dark:text-red-400",
                border: "border-red-200 dark:border-red-700",
                hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
            },
            purple: {
                bg: "bg-purple-50 dark:bg-purple-900/20",
                text: "text-purple-600 dark:text-purple-400",
                border: "border-purple-200 dark:border-purple-700",
                hover: "hover:bg-purple-100 dark:hover:bg-purple-900/30",
            },
            green: {
                bg: "bg-green-50 dark:bg-green-900/20",
                text: "text-green-600 dark:text-green-400",
                border: "border-green-200 dark:border-green-700",
                hover: "hover:bg-green-100 dark:hover:bg-green-900/30",
            },
            blue: {
                bg: "bg-blue-50 dark:bg-blue-900/20",
                text: "text-blue-600 dark:text-blue-400",
                border: "border-blue-200 dark:border-blue-700",
                hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
            },
            orange: {
                bg: "bg-orange-50 dark:bg-orange-900/20",
                text: "text-orange-600 dark:text-orange-400",
                border: "border-orange-200 dark:border-orange-700",
                hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30",
            },
            cyan: {
                bg: "bg-cyan-50 dark:bg-cyan-900/20",
                text: "text-cyan-600 dark:text-cyan-400",
                border: "border-cyan-200 dark:border-cyan-700",
                hover: "hover:bg-cyan-100 dark:hover:bg-cyan-900/30",
            },
        };
        return colors[color] || colors.red;
    };

    return (
        <div
            className={`w-full min-h-screen bg-[#f8f4f1] dark:bg-[#0b0b0b] transition-colors duration-300 relative overflow-x-hidden`}
        >
            <div className="pointer-events-none absolute -top-48 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.2),rgba(248,113,113,0))] blur-3xl" />
            <div className="pointer-events-none absolute top-24 left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.18),rgba(251,146,60,0))] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.16),rgba(244,63,94,0))] blur-3xl" />

            {/* Hero Section */}
            <div className="relative z-10 px-4 pt-10 sm:px-6 sm:pt-12">
                <div className="max-w-7xl mx-auto">
                    <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.75rem] border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl shadow-[0_40px_90px_-35px_rgba(15,23,42,0.45)] px-6 py-10 sm:px-8 sm:py-12 md:px-12 md:py-16 text-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.14),rgba(2,6,23,0))]" />
                        <div className="relative">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-red-500/10 text-red-600 rounded-2xl backdrop-blur-sm border border-red-500/20">
                                    <Shield className="h-16 w-16" />
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">
                                Welcome to Your CTF Journey! dYZ_
                            </h1>
                            <p
                                className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6"
                            >
                                You're about to embark on an exciting adventure in cybersecurity. Let's get you started with everything you need to know!
                            </p>
                            <div className="flex justify-center gap-4 flex-wrap">
                                <Link href="/problems">
                                    <button className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 sm:px-8 rounded-2xl transition-all duration-300 md:hover:scale-105 shadow-lg shadow-red-500/20 flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Start First Challenge
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-16 md:top-20 z-10 transition-colors duration-300 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
                    <div className="flex gap-2 overflow-x-auto rounded-2xl sm:rounded-full bg-white/80 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 p-1.5 sm:p-2 shadow-lg">
                        {[
                            { id: "overview", label: "Overview", icon: <BookOpen className="h-4 w-4" /> },
                            { id: "categories", label: "Categories", icon: <Puzzle className="h-4 w-4" /> },
                            { id: "howto", label: "How to Solve", icon: <Target className="h-4 w-4" /> },
                            { id: "example", label: "Example", icon: <Flag className="h-4 w-4" /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 font-semibold rounded-full border transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                    ? "border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/20"
                                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/60 dark:hover:bg-white/[0.08]"
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 sm:py-12">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                What is a CTF Challenge?
                            </h2>
                            <p className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4`}>
                                CTF (Capture The Flag) challenges are cybersecurity exercises where you solve problems to find hidden "flags" -
                                special strings that prove you've successfully completed the challenge. Think of it as a treasure hunt for hackers!
                            </p>
                            <p className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed`}>
                                Each challenge tests different skills: finding vulnerabilities in web applications, breaking encryption,
                                analyzing files, reverse engineering programs, and more. You'll earn points for each solved challenge and
                                climb the leaderboard!
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-5 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                                    <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        What does a flag look like?
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                                        Flags typically follow a specific format. Here are some examples:
                                    </p>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                                            <code className="text-red-600 dark:text-red-400 break-words">flag{"{this_is_a_sample_flag}"}</code>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                                            <code className="text-red-600 dark:text-red-400 break-words">FLAG{"{ANOTHER_EXAMPLE_123}"}</code>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                                            <code className="text-red-600 dark:text-red-400 break-words">CTF{"{y0u_f0und_m3!}"}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Essential Tips for Success
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tips.map((tip, index) => (
                                    <div
                                        key={index}
                                        className="bg-white/80 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-2xl p-4 sm:p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                                {tip.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                                                    {tip.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {tip.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === "categories" && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Challenge Categories
                            </h2>
                            <p className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8`}>
                                Explore different domains of cybersecurity. Each category tests unique skills and requires different approaches.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {categories.map((category, index) => {
                                const colors = getColorClasses(category.color);
                                return (
                                    <div
                                        key={index}
                                        className={`${colors.bg} ${colors.border} border rounded-2xl p-5 sm:p-6 transition-all duration-300 ${colors.hover} hover:shadow-2xl backdrop-blur-sm`}
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`p-3 bg-white dark:bg-gray-800 rounded-lg ${colors.text}`}>
                                                {category.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
                                                    {category.title}
                                                </h3>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                    {category.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Skills you'll learn:
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {category.skills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* How to Solve Tab */}
                {activeTab === "howto" && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                How to Solve CTF Challenges
                            </h2>
                            <p className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8`}>
                                Follow this systematic approach to tackle any CTF challenge. Practice makes perfect!
                            </p>
                        </div>

                        <div className="space-y-6">
                            {solvingSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className="bg-white/80 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-2xl p-5 sm:p-6 hover:shadow-2xl transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                {step.step}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="text-red-600 dark:text-red-400">
                                                    {step.icon}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                                {step.description}
                                            </p>
                                            <div className="bg-white/70 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-2xl p-4">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    💡 Tips:
                                                </h4>
                                                <ul className="space-y-1">
                                                    {step.tips.map((tip, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                                                        >
                                                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                            <span>{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    {index < solvingSteps.length - 1 && (
                                        <div className="flex justify-center mt-4">
                                            <ArrowRight className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Example Tab */}
                {activeTab === "example" && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                {exampleWalkthrough.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold">
                                    {exampleWalkthrough.category}
                                </span>
                                <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold">
                                    {exampleWalkthrough.difficulty}
                                </span>
                                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                                    {exampleWalkthrough.points} Points
                                </span>
                            </div>
                            <p className={`$text-lg text-gray-700 dark:text-gray-300 leading-relaxed`}>
                                Let's walk through a complete example of solving a beginner-friendly web challenge.
                                This demonstrates the thought process and techniques used in real CTF competitions.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {exampleWalkthrough.steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="bg-white/85 dark:bg-white/[0.04] border-l-4 border-red-500 rounded-2xl p-5 sm:p-6 shadow-xl"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                                {step.title}
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                                {step.content}
                                            </p>

                                            {step.action && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                                                    <div className="flex items-start gap-2">
                                                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                                                                Action:
                                                            </h4>
                                                            <p className="text-sm text-blue-800 dark:text-blue-400 break-words">
                                                                {step.action}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {step.discovery && (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                                                    <div className="flex items-start gap-2">
                                                        <Eye className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                                                                Discovery:
                                                            </h4>
                                                            <p className="text-sm text-green-800 dark:text-green-400 font-mono break-all">
                                                                {step.discovery}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {step.result && (
                                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Trophy className="h-6 w-6" />
                                                        <span className="font-bold text-lg">{step.result}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        Key Takeaways
                                    </h3>
                                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Always check common files like robots.txt, sitemap.xml, and .git directories</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>View page source - HTML comments often contain valuable hints</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Recognize common encoding schemes (Base64, Hex, URL encoding, etc.)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Document your process - it helps you learn and solve similar challenges faster</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            <div className="px-4 py-10 sm:px-6 sm:py-12 transition-colors duration-300">
                <div className="max-w-6xl mx-auto text-center bg-white/80 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-[2.5rem] py-10 px-4 sm:py-12 sm:px-6 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.4)]">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Ready to Start Your First Challenge?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
                        Put your knowledge into practice. Start with beginner challenges and work your way up!
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/problems">
                            <button className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-2xl transition-all duration-300 md:hover:scale-105 shadow-lg shadow-red-500/20 flex items-center gap-2">
                                <Flag className="h-5 w-5" />
                                Browse Challenges
                            </button>
                        </Link>
                        <Link href="/leaderboard">
                            <button className="bg-white/80 hover:bg-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-gray-900 dark:text-gray-100 font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-2xl transition-all duration-300 md:hover:scale-105 shadow-lg flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                View Leaderboard
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingGuide;
