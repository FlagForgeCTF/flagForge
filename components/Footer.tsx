import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Linkedin, Github } from "lucide-react";
import logo from "@/public/flagforge-logo.png";

export default function Footer() {
  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/flagforge/",
      icon: <Linkedin className="w-5 h-5 pointer-events-none" />,
      color: "hover:text-[#0077b5] dark:hover:text-[#38b6ff]", // Lighter blue for dark mode visibility
      bg: "hover:bg-[#0077b5]/10 dark:hover:bg-[#38b6ff]/15",
    },
    {
      name: "GitHub",
      url: "https://github.com/FlagForgeCTF/",
      icon: <Github className="w-5 h-5" />,
      color: "hover:text-gray-950 dark:hover:text-white",
      bg: "hover:bg-gray-950/10 dark:hover:bg-white/10",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/flag.forge/",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      color: "hover:text-[#E4405F]",
      bg: "hover:bg-[#E4405F]/10",
    },
  ];

  const footerLinks = [
    { name: "About", href: "/about" },
    { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Licensing", href: "/licensing" },
  ];

  return (
    <footer className="bg-white dark:bg-[#050505] border-t border-gray-100 dark:border-white/5 transition-colors duration-500 overflow-hidden">
      <div className="w-[92%] lg:w-[80%] mx-auto py-8 md:py-10">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

          {/* Left: Brand Identity */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <Link href="/" className="group flex items-center gap-3 outline-none">
              <div className="relative">
                {/* logo */}
                <Image
                  src={logo}
                  alt="FlagForge Logo"
                  height={40}
                  width={40}
                  className="relative h-8 w-8 md:h-10 md:w-10 object-contain transition-all duration-500 group-hover:rotate-6"
                />
              </div>
              <span className="text-lg md:text-xl font-bold tracking-tight text-gray-950 dark:text-white">
                FlagForge
              </span>
            </Link>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 text-center lg:text-left leading-relaxed max-w-[280px]">
              Forging excellence in cybersecurity, one flag at a time.
            </p>
          </div>

          {/* Center: Connect Section */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm text-gray-500">
              CONNECT
            </span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 transition-all duration-300 text-gray-500 dark:text-gray-400 ${social.color} ${social.bg} hover:shadow-lg hover:-translate-y-1 active:scale-95`}
                  aria-label={`Join our ${social.name}`}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Navigation */}
          <div className="flex flex-col items-center lg:items-end gap-6">
            <nav>
              <ul className="flex flex-wrap justify-center lg:justify-end gap-x-6 gap-y-3">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group/link"
                    >
                      {link.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-red-600 transition-all duration-300 group-hover/link:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

        </div>

        {/* Global Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-xs text-gray-500 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
            © {new Date().getFullYear()} FLAGFORGE. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
            <span>MAINTAINED BY</span>
            <Link
              href="https://www.linkedin.com/company/shyenasec/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 font-medium hover:underline transition-colors ml-0.5"
            >
              SHYENA
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
