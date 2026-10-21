"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/loading";
import JsonLd from "@/components/JsonLd";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  status: string;
  created: string;
  updated: string;
  thumbnail: string | null;
}


export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        "name": "Blogs",
        "item": "https://flagforgectf.com/blogs"
      }
    ]
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-[#f8f4f1] dark:bg-[#0b0b0b] transition-colors duration-300 relative overflow-hidden`}
      >
        <h1 className="sr-only">FlagForge Blog</h1>
        <h2 className="sr-only">CTF tutorials and cybersecurity updates</h2>
        <h3 className="sr-only">Latest blog posts</h3>
        <h4 className="sr-only">Blog listing</h4>
        <div className="pointer-events-none absolute -top-48 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.25),rgba(248,113,113,0))] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.2),rgba(251,146,60,0))] blur-3xl" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen bg-[#f8f4f1] dark:bg-[#0b0b0b] flex items-center justify-center transition-colors duration-300 relative overflow-hidden px-4`}
      >
        <h1 className="sr-only">FlagForge Blog</h1>
        <h2 className="sr-only">Blog error state</h2>
        <h3 className="sr-only">Unable to load posts</h3>
        <h4 className="sr-only">Try again to view articles</h4>
        <div className="pointer-events-none absolute -top-48 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.25),rgba(248,113,113,0))] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.2),rgba(251,146,60,0))] blur-3xl" />
        <div className="text-center bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-10 max-w-md w-full relative z-10">
          <h2 className="text-2xl font-bold text-red-500 mb-4 transition-colors duration-300">
            Error Loading Posts
          </h2>
          <p
            className={` text-gray-700 dark:text-gray-300 transition-colors duration-300`}
          >
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#f8f4f1] dark:bg-[#0b0b0b] transition-colors duration-300 relative overflow-hidden`}
    >
      <h2 className="sr-only">FlagForge Blog Categories</h2>
      <h3 className="sr-only">CTF insights and cybersecurity guides</h3>
      <h4 className="sr-only">Browse blog entries</h4>
      <div className="pointer-events-none absolute -top-48 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.2),rgba(248,113,113,0))] blur-3xl" />
      <div className="pointer-events-none absolute top-24 left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.2),rgba(251,146,60,0))] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.18),rgba(244,63,94,0))] blur-3xl" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "FlagForge Blog",
          description: "Discover insights, tutorials, and stories from our team at FlagForge.",
          url: "https://flagforgectf.com/blogs",
          blogPost: posts.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            url: `https://flagforgectf.com/blogs/${post.slug || post.id}`,
            datePublished: post.created,
            description: post.excerpt,
          })),
        }}
      />
      <JsonLd data={breadcrumbData} />
      <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
        <header className="relative overflow-hidden rounded-[2.75rem] border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl shadow-[0_40px_90px_-35px_rgba(15,23,42,0.45)] p-8 md:p-10 mb-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.12),rgba(2,6,23,0))]" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-3 transition-colors duration-300 tracking-tight">
              Blog Posts
            </h1>
            <p
              className={` text-lg text-gray-700 dark:text-gray-300 transition-colors duration-300 max-w-2xl`}
            >
              Discover insights, tutorials, and stories from our team
            </p>
          </div>
        </header>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white/70 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 rounded-[2.5rem] shadow-xl">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              No posts found
            </h3>
            <p
              className={` text-gray-600 dark:text-gray-400 transition-colors duration-300`}
            >
              Check back later for new content!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {posts.map((post) => {
              const postSlug = post.slug || post.id;
              return (
              <article
                key={post.id}
                className="group relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_70px_-30px_rgba(15,23,42,0.5)] hover:border-red-200/80 dark:hover:border-red-500/30 h-full flex flex-col"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.12),rgba(255,255,255,0))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* Thumbnail Image */}
                {post.thumbnail && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                      // Notion thumbnails can be hosted anywhere, not just remotePatterns hosts
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                {!post.thumbnail && (
                  <div className="relative h-48 overflow-hidden bg-[linear-gradient(120deg,rgba(248,113,113,0.15),rgba(251,146,60,0.08),rgba(255,255,255,0))] dark:bg-[linear-gradient(120deg,rgba(248,113,113,0.2),rgba(251,146,60,0.08),rgba(2,6,23,0))]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(2,6,23,0))]" />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1 relative">
                  <div className="flex items-center justify-between mb-4">
                    <time className="text-xs uppercase tracking-[0.2em] text-red-500 font-semibold transition-colors duration-300">
                      {formatDate(post.created)}
                    </time>
                    {post.status && (
                      <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full transition-colors duration-300">
                        {post.status}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-500 dark:group-hover:text-red-500 transition-colors duration-300 line-clamp-2">
                    <Link href={`/blogs/${postSlug}`}>{post.title}</Link>
                  </h2>

                  {post.excerpt && (
                    <p
                      className={` text-gray-700 dark:text-gray-300 mb-6 line-clamp-3 transition-colors duration-300`}
                    >
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-100 dark:border-white/5">
                    <Link
                      href={`/blogs/${postSlug}`}
                      className="inline-flex items-center text-red-500 font-semibold hover:text-red-600 transition-colors duration-300"
                    >
                      Read more
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
