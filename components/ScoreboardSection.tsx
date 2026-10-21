"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ExternalLink, Calendar, Users, Medal } from "lucide-react";

interface ScoreboardItem {
  _id: string;
  title: string;
  description: string;
  eventName: string;
  eventDate: string;
  totalTeams: number;
  totalPlayers: number;
  winners?: {
    rank: number;
    teamName: string;
    totalScore: number;
  }[];
  isActive: boolean;
}

export default function ScoreboardSection() {
  const [scoreboards, setScoreboards] = useState<ScoreboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScoreboards = async () => {
      try {
        const response = await fetch("/api/scoreboards");
        if (response.ok) {
          const data = await response.json();
          setScoreboards(data.slice(0, 3)); // Show only 3 latest
        }
      } catch (error) {
        console.error("Failed to fetch scoreboards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScoreboards();
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

  if (scoreboards.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-yellow-500 to-orange-600 rounded-xl text-white shadow-lg shadow-yellow-500/20">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
              Event Scoreboards
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Check out competition results and rankings
            </p>
          </div>
        </div>
        <Link
          href="/event-scoreboards"
          className="group flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors"
        >
          View All Scoreboards
          <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scoreboards.map((scoreboard) => (
          <div
            key={scoreboard._id}
            className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl">
                <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20 px-2 py-1 rounded-full">
                Completed
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
              {scoreboard.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {scoreboard.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(scoreboard.eventDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{scoreboard.totalTeams} teams</span>
              </div>
            </div>

            {scoreboard.winners && scoreboard.winners.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Medal className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Top Winner</span>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {scoreboard.winners[0].teamName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {scoreboard.winners[0].totalScore} points
                  </p>
                </div>
              </div>
            )}

            <Link
              href="/event-scoreboards"
              className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
            >
              View Scoreboard
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}