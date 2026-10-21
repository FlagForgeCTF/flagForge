"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, ExternalLink, Calendar, Users } from "lucide-react";

interface ArchiveItem {
  _id: string;
  title: string;
  description: string;
  eventName: string;
  eventDate: string;
  challengeCount: number;
  downloadCount: number;
  isActive: boolean;
}

export default function ArchivesSection() {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const response = await fetch("/api/archives");
        if (response.ok) {
          const data = await response.json();
          setArchives(data.data?.slice(0, 3) || []); // Show only 3 latest, handle data structure
        }
      } catch (error) {
        console.error("Failed to fetch archives:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-white/5 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (archives.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Archive className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
              Challenge Archives
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Explore past CTF challenges and events
            </p>
          </div>
        </div>
        <Link
          href="/archives"
          className="group flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors"
        >
          View All Archives
          <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {archives.map((archive) => (
          <div
            key={archive._id}
            className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                <Archive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-full">
                {archive.isActive ? 'Active' : 'Archived'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
              {archive.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {archive.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(archive.eventDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{archive.challengeCount} challenges</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* No per-archive route exists; the archives page lists them all */}
              <Link
                href="/archives"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
              >
                View Challenges
                <Archive className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}