"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUp, ChevronRight, Sparkles, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import Loading from "@/components/loading";

// Types
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  status: string;
  content: string;
  created: string;
  updated: string;
  image?: string | null;
  thumbnail: string | null;
  cover: string | null;
  blocks: Block[];
}

interface RichText {
  plain_text: string;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    color?: string;
  };
}

interface Block {
  id: string;
  type: string;
  [key: string]: any;
}

type BlogPostClientProps = {
  postId: string;
  initialPost: BlogPost | null;
};

export default function BlogPostClient({
  postId,
  initialPost,
}: BlogPostClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPosts, setSuggestedPosts] = useState<BlogPost[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Controls whether images above the fold should be loaded with priority. .
  const isAboveFold = true;

  // Fetch post data (fallback when server data is missing)
  useEffect(() => {
    if (post || !postId) return;

    let active = true;
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blogs/${postId}`);
        if (!response.ok) throw new Error("Failed to fetch post");
        const data = await response.json();
        if (active) setPost(data.post);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPost();
    return () => {
      active = false;
    };
  }, [post, postId]);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const normalizeText = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

  const toTokens = (text: string) =>
    normalizeText(text)
      .split(/\s+/)
      .filter((token) => token.length > 2);

  const overlapCount = (a: Set<string>, b: Set<string>) => {
    let count = 0;
    a.forEach((token) => {
      if (b.has(token)) count += 1;
    });
    return count;
  };

  const getRecommendationScore = (candidate: BlogPost, current: BlogPost) => {
    const currentTags = new Set(current.tags || []);
    const candidateTags = new Set(candidate.tags || []);
    let tagMatches = 0;
    candidateTags.forEach((tag) => {
      if (currentTags.has(tag)) tagMatches += 1;
    });

    const currentTerms = new Set(
      toTokens(`${current.title} ${current.excerpt || ""}`)
    );
    const candidateTerms = new Set(
      toTokens(`${candidate.title} ${candidate.excerpt || ""}`)
    );
    const termMatches = overlapCount(candidateTerms, currentTerms);

    const currentTime = new Date(current.created).getTime();
    const candidateTime = new Date(candidate.created).getTime();
    const dayDiff = Math.abs(currentTime - candidateTime) / 86400000;
    const recencyBoost = Math.max(0, 30 - dayDiff) / 30;
    const statusBoost =
      candidate.status && candidate.status === current.status ? 1 : 0;

    return tagMatches * 5 + termMatches * 2 + recencyBoost + statusBoost;
  };

  useEffect(() => {
    if (!post) return;
    let active = true;
    const fetchSuggested = async () => {
      setSuggestedLoading(true);
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        const allPosts: BlogPost[] = Array.isArray(data.posts)
          ? data.posts
          : [];
        const ranked = allPosts
          .filter((item) => item.id !== post.id)
          .map((item) => ({
            post: item,
            score: getRecommendationScore(item, post),
          }))
          .sort((a, b) => b.score - a.score)
          .map((item) => item.post)
          .slice(0, 3);
        if (active) setSuggestedPosts(ranked);
      } catch (err) {
        if (active) setSuggestedPosts([]);
      } finally {
        if (active) setSuggestedLoading(false);
      }
    };
    fetchSuggested();
    return () => {
      active = false;
    };
  }, [post]);

  const getTextStyles = (annotations?: RichText["annotations"]) => {
    if (!annotations) return "";

    const styles = [
      annotations.bold && "font-bold",
      annotations.italic && "italic",
      annotations.strikethrough && "line-through",
      annotations.underline && "underline",
      annotations.color === "red" && "text-red-600 dark:text-red-500",
      annotations.color === "blue" && "text-blue-600 dark:text-blue-400",
      annotations.color === "green" && "text-green-600 dark:text-green-400",
    ]
      .filter(Boolean)
      .join(" ");

    return styles;
  };

  const renderRichText = (richText: RichText[]) => {
    if (!richText?.length) return "";

    return richText.map((text, index) => (
      <span key={index} className={getTextStyles(text.annotations)}>
        {text.plain_text}
      </span>
    ));
  };

  // Content rendering functions
  const renderBlock = (block: Block) => {
    const { type, id } = block;
    const value = block[type];
    if (!value) return null;

    const blockComponents = {
      paragraph: (
        <p
          className={` mb-6 text-gray-800 dark:text-gray-300 leading-relaxed text-[1.05rem] transition-colors duration-300`}
        >
          {renderRichText(value.rich_text || [])}
        </p>
      ),
      heading_1: (
        <h2
          className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 mt-12 first:mt-0 tracking-tight transition-colors duration-300`}
        >
          {value.rich_text?.map((text: RichText) => text.plain_text).join("") ||
            ""}
        </h2>
      ),
      heading_2: (
        <h2
          className={`text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-5 mt-10 tracking-tight transition-colors duration-300`}
        >
          {value.rich_text?.map((text: RichText) => text.plain_text).join("") ||
            ""}
        </h2>
      ),
      heading_3: (
        <h3
          className={`text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4 mt-8 tracking-tight transition-colors duration-300`}
        >
          {value.rich_text?.map((text: RichText) => text.plain_text).join("") ||
            ""}
        </h3>
      ),
      bulleted_list_item: (
        <li
          className={` mb-2 text-gray-800 dark:text-gray-300 text-[1.05rem] leading-relaxed transition-colors duration-300`}
        >
          {renderRichText(value.rich_text || [])}
        </li>
      ),
      numbered_list_item: (
        <li
          className={` mb-2 text-gray-800 dark:text-gray-300 text-[1.05rem] leading-relaxed transition-colors duration-300`}
        >
          {renderRichText(value.rich_text || [])}
        </li>
      ),
      code: (
        <pre className="bg-[#0f172a] dark:bg-[#0b1120] p-5 rounded-2xl mb-6 overflow-x-auto border border-white/10 shadow-lg shadow-slate-900/20 transition-colors duration-300">
          <code className="text-[0.95rem] text-slate-100 font-mono transition-colors duration-300">
            {value.rich_text
              ?.map((text: RichText) => text.plain_text)
              .join("") || ""}
          </code>
        </pre>
      ),
      quote: (
        <blockquote
          className={` border-l-4 border-red-500 dark:border-red-500 pl-6 my-8 italic text-gray-700 dark:text-gray-400 text-[1.05rem] bg-white/70 dark:bg-white/[0.03] py-5 rounded-r-2xl transition-colors duration-300`}
        >
          {renderRichText(value.rich_text || [])}
        </blockquote>
      ),
      divider: (
        <hr className="my-12 border-gray-200 dark:border-white/10 transition-colors duration-300" />
      ),
      image: (
        <div className="my-8">
          {(value.external?.url || value.file?.url) && (
            <Image
              src={value.external?.url || value.file?.url}
              alt={value.caption?.[0]?.plain_text || "Blog image"}
              width={800}
              height={400}
              className="rounded-2xl w-full h-auto shadow-2xl border border-white/30 dark:border-white/10"
              priority={isAboveFold}
              loading="lazy"
            />
          )}
          {value.caption?.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center italic transition-colors duration-300">
              {value.caption[0].plain_text}
            </p>
          )}
        </div>
      ),
    };

    return (
      <div key={id}>
        {blockComponents[type as keyof typeof blockComponents] || null}
      </div>
    );
  };

  // Secure markdown rendering with react-markdown
  const renderMarkdownContent = (content: string) => {
    if (!content) return null;

    // Limit content length as a security measure
    const maxLength = 100000; // 100KB limit
    const sanitizedContent =
      content.length > maxLength
        ? content.substring(0, maxLength) +
          "\n\n*[Content truncated for security]*"
        : content;

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeHighlight, // Syntax highlighting for code blocks
          rehypeSanitize, // Sanitizes HTML to prevent XSS
        ]}
        components={{
          // Custom component styling
          h1: ({ children }) => (
            <h2
              className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 mt-12 first:mt-0 tracking-tight transition-colors duration-300`}
            >
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-5 mt-10 tracking-tight transition-colors duration-300`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4 mt-8 tracking-tight transition-colors duration-300`}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p
              className={` mb-6 text-gray-800 dark:text-gray-300 leading-relaxed text-[1.05rem] transition-colors duration-300`}
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={` list-disc list-inside mb-6 space-y-2 pl-4`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={` list-decimal list-inside mb-6 space-y-2 pl-4`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              className={` text-gray-800 dark:text-gray-300 text-[1.05rem] leading-relaxed transition-colors duration-300`}
            >
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={` border-l-4 border-red-500 dark:border-red-500 pl-6 my-8 italic text-gray-700 dark:text-gray-400 text-[1.05rem] bg-white/70 dark:bg-white/[0.03] py-5 rounded-r-2xl transition-colors duration-300`}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            // Check if it's inline code (no language class) or block code
            const isInline = !className || !className.startsWith("language-");

            return isInline ? (
              <code className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                {children}
              </code>
            ) : (
              <code
                className={`block bg-[#0f172a] dark:bg-[#0b1120] p-5 rounded-2xl overflow-x-auto border border-white/10 shadow-lg shadow-slate-900/20 transition-colors duration-300 text-[0.95rem] font-mono text-slate-100 ${className}`}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[#0f172a] dark:bg-[#0b1120] p-5 rounded-2xl mb-6 overflow-x-auto border border-white/10 shadow-lg shadow-slate-900/20 transition-colors duration-300">
              {children}
            </pre>
          ),
          hr: () => (
            <hr className="my-12 border-gray-200 dark:border-white/10 transition-colors duration-300" />
          ),
          img: ({ src, alt }) => (
            <div className="my-8">
              <Image
                src={src || ""}
                alt={alt || "Blog image"}
                width={800}
                height={400}
                className="rounded-2xl w-full h-auto shadow-2xl border border-white/30 dark:border-white/10"
              />
            </div>
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    );
  };

  const groupListItems = (blocks: Block[]) => {
    const result: (
      | Block
      | { type: "list_group"; listType: string; items: Block[]; id: string }
    )[] = [];
    let i = 0;

    while (i < blocks.length) {
      const block = blocks[i];

      if (
        block.type === "bulleted_list_item" ||
        block.type === "numbered_list_item"
      ) {
        const listType = block.type;
        const listItems: Block[] = [];

        while (i < blocks.length && blocks[i].type === listType) {
          listItems.push(blocks[i]);
          i++;
        }

        result.push({
          type: "list_group",
          listType,
          items: listItems,
          id: `list_${listItems[0].id}`,
        });
      } else {
        result.push(block);
        i++;
      }
    }

    return result;
  };

  const renderContent = () => {
    // Render Notion blocks if available
    if (post?.blocks?.length) {
      const groupedBlocks = groupListItems(post.blocks);

      return groupedBlocks.map((item) => {
        if (item.type === "list_group") {
          const ListTag = item.listType === "numbered_list_item" ? "ol" : "ul";
          const listClasses =
            item.listType === "numbered_list_item"
              ? "list-decimal list-inside mb-6 space-y-2 pl-4"
              : "list-disc list-inside mb-6 space-y-2 pl-4";

          return (
            <ListTag key={item.id} className={listClasses}>
              {item.items.map(renderBlock)}
            </ListTag>
          );
        }

        return renderBlock(item as Block);
      });
    }

    return post?.content ? (
      renderMarkdownContent(post.content)
    ) : (
      <p className="italic text-gray-600 dark:text-gray-400 transition-colors duration-300">
        No content available
      </p>
    );
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-[#f8f4f1] dark:bg-[#0b0b0b] transition-colors duration-300 relative overflow-hidden`}
      >
        <h1 className="sr-only">FlagForge Blog Post</h1>
        <h2 className="sr-only">CTF tutorials and cybersecurity insights</h2>
        <h3 className="sr-only">Loading blog content</h3>
        <h4 className="sr-only">Please wait</h4>
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
        <h1 className="sr-only">FlagForge Blog Post</h1>
        <h2 className="sr-only">Blog post unavailable</h2>
        <h3 className="sr-only">Error loading content</h3>
        <h4 className="sr-only">Return to blogs</h4>
        <div className="pointer-events-none absolute -top-48 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.25),rgba(248,113,113,0))] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.2),rgba(251,146,60,0))] blur-3xl" />
        <div className="text-center bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-10 max-w-md w-full relative z-10">
          <p className="text-red-500 text-lg mb-4 transition-colors duration-300">
            Error: {error}
          </p>
          <button
            onClick={() => router.push("/blogs")}
            className="text-red-500 underline underline-offset-4 hover:text-red-700 transition-colors duration-300"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className={`min-h-screen bg-[#f8f4f1] dark:bg-[#0b0b0b] flex items-center justify-center transition-colors duration-300 relative overflow-hidden px-4 py-16`}
      >
        <h1 className="sr-only">FlagForge Blog Post</h1>
        <h2 className="sr-only">Post not found</h2>
        <h3 className="sr-only">Browse other CTF articles</h3>
        <h4 className="sr-only">Back to blogs</h4>
        <div className="pointer-events-none absolute -top-48 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.25),rgba(248,113,113,0))] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.2),rgba(251,146,60,0))] blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.14),rgba(2,6,23,0))]" />
        <div className="relative z-10 w-full max-w-lg rounded-[2.5rem] border border-white/60 bg-white/80 p-10 text-center shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100/80 text-red-600 shadow-inner dark:bg-red-900/30 dark:text-red-400">
            <Sparkles className="h-7 w-7" />
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Post not found.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try heading back to the blog index and browse the latest posts.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blogs
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-300 dark:hover:text-white"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const heroImage = post.cover || post.thumbnail || null;

  return (
    <div
      className={`min-h-screen bg-[#f8f4f1] dark:bg-[#0b0b0b] transition-colors duration-300 relative overflow-hidden`}
    >
      <h3 className="sr-only">FlagForge blog insights</h3>
      <h4 className="sr-only">Cybersecurity article content</h4>
      <div className="pointer-events-none absolute -top-48 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.2),rgba(248,113,113,0))] blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.18),rgba(251,146,60,0))] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.18),rgba(244,63,94,0))] blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20 pt-10 scroll-smooth">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors duration-300 text-sm font-semibold uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blogs
        </Link>

        <header className="relative overflow-hidden rounded-[2.75rem] border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl shadow-[0_40px_90px_-35px_rgba(15,23,42,0.45)] mt-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.16),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.12),rgba(2,6,23,0))]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] p-8 md:p-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p
                  className={` text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed`}
                >
                  {post.excerpt}
                </p>
              )}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold uppercase tracking-widest"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/60 dark:border-white/20 bg-white/80 dark:bg-white/[0.08] p-6 shadow-xl dark:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-300 mb-2">
                  Published
                </p>
                <time className="text-red-600 font-semibold text-lg">
                  {formatDate(post.created)}
                </time>
                {post.updated !== post.created && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Updated: {formatDate(post.updated)}
                  </p>
                )}
                {post.status && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-green-700 dark:text-green-400">
                    {post.status}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <article
          className={` mt-12 bg-white/70 dark:bg-white/[0.02] border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.4)]`}
        >
          {heroImage && (
            <div className="mb-10 overflow-hidden rounded-2xl border border-white/60 dark:border-white/10 shadow-2xl">
              <Image
                src={heroImage}
                alt={post.title}
                width={960}
                height={540}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          )}
          {renderContent()}
        </article>

        {post.image && post.image !== heroImage && (
          <div className="mt-12">
            <Image
              src={post.image}
              alt={post.title}
              width={900}
              height={500}
              className="rounded-2xl w-full h-auto shadow-2xl border border-white/30 dark:border-white/10"
            />
          </div>
        )}

        <section className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Suggested Blogs
            </h2>
          </div>
          {suggestedLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-[2rem] border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-6 shadow-lg"
                >
                  <div className="h-32 rounded-xl bg-gray-200 dark:bg-white/10 mb-5" />
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : suggestedPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suggestedPosts.map((item) => (
                <article
                  key={item.id}
                  className="group h-full rounded-[2rem] border border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl shadow-lg hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col"
                >
                  <div className="relative h-40 bg-[linear-gradient(120deg,rgba(248,113,113,0.15),rgba(251,146,60,0.08),rgba(255,255,255,0))] dark:bg-[linear-gradient(120deg,rgba(248,113,113,0.2),rgba(251,146,60,0.08),rgba(2,6,23,0))]">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 300px, 90vw"
                        // Notion thumbnails can be hosted anywhere, not just remotePatterns hosts
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <time className="text-xs uppercase tracking-[0.2em] text-red-500 font-semibold">
                      {formatDate(item.created)}
                    </time>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-3 mb-3 group-hover:text-red-500 transition-colors duration-300 line-clamp-2">
                      <Link href={`/blogs/${item.slug || item.id}`}>
                        {item.title}
                      </Link>
                    </h3>
                    {item.excerpt && (
                      <p
                        className={` text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-6`}
                      >
                        {item.excerpt}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                      <Link
                        href={`/blogs/${item.slug || item.id}`}
                        className="inline-flex items-center gap-2 text-red-600 font-semibold text-sm hover:text-red-700 transition-colors duration-300"
                      >
                        Read more
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              No related posts available yet.
            </div>
          )}
        </section>
      </div>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-red-600 text-white p-3 shadow-2xl shadow-red-600/30 hover:bg-red-700 transition-all duration-300 active:scale-95"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
