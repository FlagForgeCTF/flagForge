"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { landingFaqItems } from "@/lib/faq";

// Import images statically
import nirmalImage from "@/public/NirmalDahal.jpeg";
import sobitImage from "@/public/SobitThakuri.jpeg";
import bibekImage from "@/public/bibekghimire.jpeg";

import {
  ArrowRight,
  Globe,
  KeyRound,
  Cpu,
  Search,
  Bug,
  Puzzle,
  ChevronDown,
} from "lucide-react";

const testimonials = [
  {
    name: "Nirmal Dahal",
    position: "Cofounder, Cryptogen Nepal",
    image: nirmalImage,
    testimonial:
      "FlagForge provides an exceptional platform for cybersecurity professionals to validate their skills. The challenges mirror real-world attack vectors and help teams stay sharp in an ever-evolving threat landscape.",
  },
  {
    name: "Sobit Thakuri",
    position: "Information Security Officer, ISO 27001:2022 Lead Auditor",
    image: sobitImage,
    testimonial:
      "I appreciate FlagForge's comprehensive approach to security training. The platform effectively bridges the gap between theoretical knowledge and practical application in cybersecurity.",
  },
  {
    name: "Bibek Ghimire",
    position: "CTO, Bardali Creation",
    image: bibekImage,
    testimonial:
      "FlagForge is an engaging and fun CTF platform that helped me sharpen my cybersecurity and problem-solving skills in web exploitation and cryptography. A great place to learn, compete, and grow as a hacker!",
  },
];

const categories = [
  {
    icon: Globe,
    title: "Web Exploitation",
    description: "SQL injection, XSS, CSRF and the other ways web apps fall over.",
  },
  {
    icon: KeyRound,
    title: "Cryptography",
    description: "Break classical ciphers, then move on to misused modern ones.",
  },
  {
    icon: Cpu,
    title: "Reverse Engineering",
    description: "Read assembly, pick apart binaries, find what the author hid.",
  },
  {
    icon: Search,
    title: "Forensics",
    description: "Memory dumps, packet captures, deleted files and metadata.",
  },
  {
    icon: Bug,
    title: "Binary Exploitation",
    description: "Buffer overflows, format strings and other memory bugs.",
  },
  {
    icon: Puzzle,
    title: "Miscellaneous",
    description: "OSINT, steganography, logic puzzles — the odd ones out.",
  },
];

const features = [
  {
    title: "Learn by doing",
    description: "Every challenge is a real problem with a real flag. No multiple choice.",
  },
  {
    title: "Hints when you're stuck",
    description: "Spend points to unlock a nudge instead of giving up or looking up a writeup.",
  },
  {
    title: "A leaderboard worth climbing",
    description: "Points, solve history and rank — see how you stack up against other players.",
  },
  {
    title: "GRC learning hub",
    description: "Free, structured lessons on governance, risk and compliance, from basics to board-level frameworks.",
  },
];

const steps = [
  { title: "Create an account", description: "It's free. Sign in and you're ready." },
  { title: "Pick a challenge", description: "Filter by category and difficulty." },
  { title: "Find the flag", description: "Solve it however you like, then submit." },
  { title: "Earn points", description: "Correct flags move you up the leaderboard." },
];

const stats = [
  { number: "100+", label: "challenges" },
  { number: "1,000+", label: "players" },
  { number: "6", label: "categories" },
  { number: "Free", label: "forever" },
];

const Hero: React.FC = () => {
  const { status } = useSession();
  const ctaHref = status === "authenticated" ? "/problems" : "/authentication";

  return (
    <div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 lg:pt-28 lg:pb-28 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">
            Capture the flag, for free
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            Learn security by
            <br />
            breaking things.
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
            FlagForge is a CTF playground with challenges in web exploitation,
            cryptography, reverse engineering, forensics and more. Find the
            flag, submit it, climb the board.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Start solving
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-current"
            >
              View leaderboard
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-neutral-200 dark:border-neutral-800 pt-6 max-w-lg">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{stat.number}</dd>
                <dd className="text-sm text-neutral-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Terminal sample */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-300 font-mono text-[13px] leading-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-800">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
            <span className="ml-3 text-xs text-neutral-500">~/challenges/crypto</span>
          </div>
          <pre className="p-5 overflow-x-auto whitespace-pre">
<span className="text-neutral-500">$</span> cat cipher.txt{"\n"}
Synt{"{"}e0g13_1f_abg_3apelcg10a{"}"}{"\n"}
{"\n"}
<span className="text-neutral-500">$</span> tr &apos;A-Za-z&apos; &apos;N-ZA-Mn-za-m&apos; &lt; cipher.txt{"\n"}
<span className="text-green-400">Flag{"{"}r0t13_1s_not_3ncrypt10n{"}"}</span>{"\n"}
{"\n"}
<span className="text-neutral-500">$</span> submit --challenge 42{"\n"}
<span className="text-neutral-400">Correct. +50 points.</span>
          </pre>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">What you&apos;ll work on</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-xl">
            Six categories, from beginner-friendly warmups to problems that will take you an evening.
          </p>

          <ul className="mt-10 grid gap-px bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ icon: Icon, title, description }) => (
              <li key={title} className="bg-white dark:bg-neutral-950 p-6">
                <Icon className="h-5 w-5 text-red-600 dark:text-red-400" strokeWidth={1.75} />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features + steps */}
      <section className="bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 grid gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Why FlagForge</h2>
            <dl className="mt-8 space-y-6">
              {features.map((feature) => (
                <div key={feature.title}>
                  <dt className="font-semibold">{feature.title}</dt>
                  <dd className="mt-1 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How it works</h2>
            <ol className="mt-8 space-y-6">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium tabular-nums">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20" aria-labelledby="testimonials-title">
        <h2 id="testimonials-title" className="text-2xl sm:text-3xl font-bold tracking-tight">
          What people say
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col">
              <blockquote className="text-neutral-700 dark:text-neutral-300 leading-relaxed flex-1">
                &ldquo;{t.testimonial}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="text-sm">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-neutral-500">{t.position}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Questions</h2>
          <div className="mt-8 divide-y divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800">
            {landingFaqItems.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        <div className="rounded-lg bg-neutral-900 dark:bg-neutral-900 border border-neutral-800 px-6 py-12 sm:px-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Ready to find your first flag?</h2>
            <p className="mt-1 text-neutral-400">Takes a minute to sign up. No card, no trial.</p>
          </div>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-md bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Hero;
