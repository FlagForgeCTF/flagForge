"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import QustionCards from "@/components/QuestionCards";
import Loading from "@/components/loading";
import AuthError from "@/components/authError";
import { IoFilter, IoChevronDown, IoSearch } from "react-icons/io5";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Archive } from "lucide-react";
import { Questions } from "@/interfaces";


// Extended interface to include expiry information
interface QuestionWithExpiry extends Questions {
  expired?: boolean;
  timeRemaining?: number;
  expiryDate?: string;
}

interface Problem {
  _id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  link: string;
  done: any;
  createdAt: string;
  updatedAt: string;
  __v: number;
  flag?: string;
  expired?: boolean;
  timeRemaining?: number;
  expiryDate?: string;
  solveCount?: number;
}

interface PaginationData {
  hasNext: boolean;
  totalPages: number;
  total: number;
}

interface ApiResponse {
  data: Problem[];
  totalScore: number;
  questionDone: any;
  pagination: PaginationData;
}

// Constants
const DEFAULT_CATEGORIES = [
  "All",
  "Web Exploitation",
  "Cryptography",
  "Reverse Engineering",
  "Forensics",
  "General Skills",
  "Binary Exploitation",
  "IOT",
];

const UPDATE_INTERVAL = 60000; // 1 minute
const DESCRIPTION_TRUNCATE_LENGTH = 95;

// Utility functions
const formatTimeRemaining = (timeMs: number): string => {
  if (timeMs <= 0) return "Expired";

  const days = Math.floor(timeMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  } else {
    return `${minutes}m left`;
  }
};

const sanitizeProblems = (data: Problem[]): Problem[] =>
  data.map(({ flag, ...rest }) => rest);

// Custom hooks
const useCategories = () => {
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        console.error("Failed to fetch categories");
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, fetchCategories };
};

const useProblems = (
  currentPage: number,
  selectedCategory: string,
  categoriesLoading: boolean
) => {
  const [problems, setProblems] = useState<QuestionWithExpiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [questionDone, setQuestionDone] = useState<any>();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      let apiUrl = `/api/problems?page=${currentPage}`;
      if (selectedCategory && selectedCategory !== "All") {
        apiUrl += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = "Failed to fetch problems";

        if (contentType.includes("application/json")) {
          const errorDetails = await response.json();
          message = errorDetails.message || message;
        } else {
          const text = await response.text();
          if (text) message = text;
        }

        throw new Error(message);
      }

      const { data, totalScore, questionDone, pagination }: ApiResponse =
        await response.json();

      const sanitizedData = sanitizeProblems(data);
      setScore(totalScore);
      setProblems(sanitizedData);
      setQuestionDone(questionDone);
      setHasNextPage(pagination.hasNext);
      setTotalPages(pagination.totalPages);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = error.message || "Unable to fetch problems.";
        if (message.toLowerCase().includes("unauthorized")) {
          setErrorMessage(null);
        } else {
          console.error("Failed to fetch problems:", message);
          setErrorMessage("Unable to fetch problems. Please try again later.");
        }
      } else {
        console.error("An unknown error occurred:", error);
        setErrorMessage("Unable to fetch problems. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    if (!categoriesLoading) {
      fetchProblems();
    }
  }, [fetchProblems, categoriesLoading]);

  return {
    problems,
    setProblems,
    loading,
    score,
    questionDone,
    hasNextPage,
    totalPages,
    fetchProblems,
    errorMessage,
  };
};

// Sub-components
const StatsSection: React.FC<{
  score: number;
  questionDone: any;
}> = ({ score, questionDone }) => (
  <div className="w-full rounded-2xl border border-red-100/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl px-4 sm:px-6 py-4 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.6)] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
      <h2 className="text-center text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-100 tracking-tight transition-colors duration-300">
        Score: &nbsp;
        <span className="text-red-500 dark:text-red-400 font-extrabold transition-colors duration-300">
          {score}
        </span>
      </h2>

      <p className="text-center text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300 tracking-tight transition-colors duration-300">
        Total Question Solved:&nbsp;
        <span className="text-red-500 dark:text-red-400 font-extrabold transition-colors duration-300">
          {questionDone?.length || 0}
        </span>
      </p>
    </div>

  </div>
);

const DesktopFilter: React.FC<{
  categories: string[];
  categoriesLoading: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}> = ({
  categories,
  categoriesLoading,
  selectedCategory,
  onCategoryChange,
}) => (
    <div className="hidden sm:flex items-center justify-between gap-4 w-full rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl px-4 py-3 mb-4 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.45)] flex-wrap">
      <div className="flex items-center gap-2">
        <IoFilter className="text-xl text-gray-500 dark:text-gray-300" />
        <span className="text-gray-600 dark:text-gray-300 font-semibold">
          Filter by Category:
        </span>
      </div>

      <div className="relative">
        {categoriesLoading ? (
          <div className="bg-white/80 dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 text-gray-500">
            Loading categories...
          </div>
        ) : (
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none bg-white/90 dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 pr-10 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors duration-300 shadow-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}
        <IoChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>

      {selectedCategory !== "All" && (
        <button
          onClick={() => onCategoryChange("All")}
          className="text-sm bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-sm transition-colors duration-300"
        >
          Clear Filter
        </button>
      )}
    </div>
  );

const MobileFilter: React.FC<{
  show: boolean;
  categories: string[];
  categoriesLoading: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}> = ({
  show,
  categories,
  categoriesLoading,
  selectedCategory,
  onCategoryChange,
}) => {
    if (!show) return null;

    return (
      <div className="sm:hidden mb-4">
        <div className="bg-white/80 dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg p-4 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Filter by Category
          </h3>
          {categoriesLoading ? (
            <div className="text-center py-4 text-gray-500">
              Loading categories...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`px-3 py-2 text-sm rounded-xl transition-colors duration-300 ${selectedCategory === category
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-gray-100/90 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}> = ({ value, onChange, loading = false }) => (
  <div className="w-full rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl px-4 py-3 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.45)]">
    <div className="relative flex items-center">
      <IoSearch
        className={`absolute left-4 text-gray-500 ${loading ? "animate-spin" : ""
          }`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search challenges..."
        aria-label="Search challenges"
        className="w-full rounded-full border border-gray-200/80 dark:border-white/10 bg-white/90 dark:bg-gray-900/70 py-2.5 pl-11 pr-4 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors duration-300"
      />
    </div>
  </div>
);

const FilterResultsInfo: React.FC<{
  selectedCategory: string;
  problemsCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  isSearching: boolean;
}> = ({
  selectedCategory,
  problemsCount,
  currentPage,
  totalPages,
  searchQuery,
  isSearching,
}) => (
    <div className="flex justify-between items-center mb-4 w-full">
      <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
        {searchQuery.trim() ? (
          <span>
            {isSearching
              ? "Searching..."
              : `Showing ${problemsCount} matching challenges`}
          </span>
        ) : selectedCategory !== "All" ? (
          <span>
            Showing {problemsCount} challenges in "{selectedCategory}" (Page{" "}
            {currentPage} of {totalPages})
          </span>
        ) : (
          <span>
            Showing all challenges (Page {currentPage} of {totalPages})
          </span>
        )}
      </div>
    </div>
  );

const ExpiryOverlay: React.FC<{
  expiryDate?: string;
  expired?: boolean;
  timeRemaining?: number;
}> = ({ expiryDate, expired, timeRemaining }) => {
  if (!expiryDate) return null;

  return (
    <>
      <div
        className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur ${expired
            ? "bg-red-500/90 text-white"
            : "bg-yellow-400/90 text-black"
          }`}
      >
        {expired
          ? "EXPIRED"
          : timeRemaining
            ? formatTimeRemaining(timeRemaining)
            : "Limited Time"}
      </div>

      {expired && (
        <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center rounded-2xl">
          {/* Expired overlay without text to avoid duplication */}
        </div>
      )}
    </>
  );
};

const NoProblemsMessage: React.FC<{
  selectedCategory: string;
  onShowAll: () => void;
}> = ({ selectedCategory, onShowAll }) => (
  <div className="col-span-full text-center py-12">
    <div className="text-gray-500 dark:text-gray-400 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl px-6 py-10">
      <IoFilter className="mx-auto text-4xl mb-4 opacity-50" />
      <p className="text-lg font-medium">No challenges found</p>
      <p className="text-sm">
        {selectedCategory !== "All"
          ? `No challenges available in "${selectedCategory}" category`
          : "No challenges available at the moment"}
      </p>
      {selectedCategory !== "All" && (
        <button
          onClick={onShowAll}
          className="mt-4 text-red-500 hover:text-red-600 underline"
        >
          View all challenges
        </button>
      )}
    </div>
  </div>
);

const PaginationControls: React.FC<{
  currentPage: number;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ currentPage, hasNextPage, onPrevious, onNext }) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = !hasNextPage;

  return (
    <div className="flex justify-center sm:justify-end gap-3 w-full">
      <button
        onClick={isFirstPage ? (e) => e.preventDefault() : onPrevious}
        aria-disabled={isFirstPage}
        title={isFirstPage ? "You are on the first page" : "Go to previous page"}
        className={`font-semibold text-sm sm:text-base rounded-full px-5 py-2 text-white shadow-sm transition-colors duration-300 ${isFirstPage
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-red-500/90 hover:bg-red-600"
          }`}
      >
        Previous
      </button>
      <button
        onClick={isLastPage ? (e) => e.preventDefault() : onNext}
        aria-disabled={isLastPage}
        title={isLastPage ? "You are on the last page" : "Go to next page"}
        className={`font-semibold text-sm sm:text-base rounded-full px-5 py-2 text-white shadow-sm transition-colors duration-300 ${isLastPage
            ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
            : "bg-red-500/90 dark:bg-red-500 hover:bg-red-600 dark:hover:bg-red-600"
          }`}
      >
        Next
      </button>
    </div>
  );
};

const Page: React.FC = () => {
  const { status: sessionStatus } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<QuestionWithExpiry[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { categories, loading: categoriesLoading } = useCategories();
  const {
    problems,
    setProblems,
    loading: problemsLoading,
    score,
    questionDone,
    hasNextPage,
    totalPages,
    errorMessage,
  } = useProblems(currentPage, selectedCategory, categoriesLoading);

  const fetchAllProblems = useCallback(
    async (category: string) => {
      let page = 1;
      let hasNext = true;
      const allProblems: QuestionWithExpiry[] = [];

      while (hasNext) {
        let apiUrl = `/api/problems?page=${page}&limit=1000`;
        if (category && category !== "All") {
          apiUrl += `&category=${encodeURIComponent(category)}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch problems");
        }

        const { data, pagination }: ApiResponse = await response.json();
        const sanitizedData = sanitizeProblems(data);
        allProblems.push(...sanitizedData);

        hasNext = Boolean(pagination?.hasNext);
        page += 1;

        if (!pagination || data.length === 0) {
          hasNext = false;
        }
      }

      return allProblems;
    },
    []
  );

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const allProblems = await fetchAllProblems(selectedCategory);
        if (cancelled) return;
        const normalizedQuery = query.toLowerCase();
        const filtered = allProblems.filter((problem) => {
          const title = problem.title?.toLowerCase() || "";
          const description = problem.description?.toLowerCase() || "";
          const category = problem.category?.toLowerCase() || "";
          return (
            title.includes(normalizedQuery) ||
            description.includes(normalizedQuery) ||
            category.includes(normalizedQuery)
          );
        });
        setSearchResults(filtered);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to search problems:", error);
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fetchAllProblems, searchQuery, selectedCategory]);

  const isSearchActive = searchQuery.trim().length > 0;
  const visibleProblems = isSearchActive ? searchResults : problems;
  const shouldShowNoProblems =
    visibleProblems.length === 0 &&
    !searchLoading &&
    (isSearchActive || !problemsLoading);

  // Handle category filter change
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowFilterDropdown(false);
  }, []);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [hasNextPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  }, [currentPage]);

  // Update time remaining for expiring challenges
  useEffect(() => {
    const interval = setInterval(() => {
      setProblems((prevProblems) =>
        prevProblems.map((problem) => {
          if (problem.expiryDate && !problem.expired) {
            const now = new Date();
            const expiryDate = new Date(problem.expiryDate);
            const timeRemaining = Math.max(
              0,
              expiryDate.getTime() - now.getTime()
            );
            return {
              ...problem,
              expired: timeRemaining <= 0,
              timeRemaining,
            };
          }
          return problem;
        })
      );
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [setProblems]);

  // Loading states
  if (problemsLoading && categoriesLoading) {
    return <Loading />;
  }

  // Remove authentication requirement - allow public browsing
  if (sessionStatus === "loading") {
    return <Loading />;
  }

  // Note: Removed authentication check to allow public browsing
  // Authentication will be required only when solving challenges

  const shouldShowPagination =
    !isSearchActive && (problems.length > 0 || currentPage > 1);

  return (
    <div className="relative flex flex-col justify-center items-center gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 min-h-screen bg-gradient-to-b from-white via-red-50/40 to-white dark:from-gray-950 dark:via-gray-900/40 dark:to-gray-950 animate-in fade-in duration-500">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight text-center text-red-500 font-bold drop-shadow-sm">
        Challenges
      </h1>

      {/* CTF Archives Link */}
      <div className="w-full flex justify-center">
        <Link
          href="/archives"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Archive className="h-5 w-5" />
          Browse CTF Archives
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Past Challenges</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="w-full rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-center text-sm font-semibold text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Stats Section - only show for authenticated users */}
      {sessionStatus === "authenticated" && (
        <StatsSection
          score={score}
          questionDone={questionDone}
        />
      )}

      {/* Filter Section */}
      <div className="w-full">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          loading={searchLoading}
        />

        {/* Mobile Filter Button (shown to everyone, not just signed-in users) */}
        <div className="flex justify-center mt-3 sm:hidden">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 rounded-full border border-red-100/70 dark:border-white/10 bg-red-50/80 dark:bg-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm transition-colors duration-300 hover:bg-red-100/80 dark:hover:bg-white/20"
            aria-label="Toggle filter dropdown"
            aria-expanded={showFilterDropdown}
          >
            <IoFilter className="text-lg" />
            Filter
          </button>
        </div>

        <DesktopFilter
          categories={categories}
          categoriesLoading={categoriesLoading}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <MobileFilter
          show={showFilterDropdown}
          categories={categories}
          categoriesLoading={categoriesLoading}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <FilterResultsInfo
          selectedCategory={selectedCategory}
          problemsCount={visibleProblems.length}
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          isSearching={searchLoading}
        />
      </div>

      {/* Problems Grid */}
      <div className="w-full flex justify-center">
        <div
          className="w-full grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 items-stretch gap-5 sm:gap-6"
          aria-busy={problemsLoading}
        >
          {visibleProblems.length > 0 ? (
            visibleProblems.map(
              ({
                title,
                category,
                points,
                description,
                _id,
                done,
                expired,
                timeRemaining,
                expiryDate,
                solveCount,
              }: QuestionWithExpiry) => (
                <div
                  key={_id}
                  className="relative transition-transform duration-300 hover:-translate-y-1"
                >
                  <QustionCards
                    title={title}
                    category={category}
                    points={points}
                    description={description.substring(
                      0,
                      DESCRIPTION_TRUNCATE_LENGTH
                    )}
                    done={questionDone}
                    _id={_id}
                    solveCount={solveCount}
                  />

                  <ExpiryOverlay
                    expiryDate={expiryDate}
                    expired={expired}
                    timeRemaining={timeRemaining}
                  />
                </div>
              )
            )
          ) : shouldShowNoProblems ? (
            <NoProblemsMessage
              selectedCategory={selectedCategory}
              onShowAll={() => handleCategoryChange("All")}
            />
          ) : null}
        </div>
      </div>

      {/* Pagination */}
      {shouldShowPagination && (
        <PaginationControls
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          onPrevious={handlePrevPage}
          onNext={handleNextPage}
        />
      )}

      <div className="w-full grid gap-4 lg:grid-cols-3 pt-4">
        <div className="lg:col-span-2 rounded-2xl border border-red-100/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl px-5 sm:px-6 py-5 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.6)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
            Mission Briefing
          </p>
          <p className="mt-2 text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-100">
            Choose a challenge, solve it, and climb the board. Filter by
            category or search to find your next target fast.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <span className="rounded-full border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-4 py-2">
              Category: {selectedCategory}
            </span>
            <span className="rounded-full border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href="/archives"
              className="rounded-full border border-purple-200/70 dark:border-purple-400/30 bg-purple-50/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 px-4 py-2 transition-colors duration-300 flex items-center gap-1"
            >
              <Archive className="h-3 w-3" />
              View Archives
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl px-5 sm:px-6 py-5 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.6)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
            Legend
          </p>
          <div className="mt-4 space-y-3 text-sm font-semibold">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <span className="inline-flex items-center rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-semibold text-black">
                Limited Time
              </span>
              Timed challenge window
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <span className="inline-flex items-center rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white">
                Expired
              </span>
              No longer available
            </div>
          </div>
        </div>
      </div>

      <div className="w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl px-5 py-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-center gap-3">
            <IoSearch className="text-2xl text-red-500" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-100">
              Search Fast
            </p>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Use keywords to find challenges by title, description, or category.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl px-5 py-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-center gap-3">
            <IoFilter className="text-2xl text-red-500" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-100">
              Filter Smart
            </p>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Narrow down by category to focus on the skills you want to train.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl px-5 py-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-center gap-3">
            <IoChevronDown className="text-2xl text-red-500" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-100">
              Pick + Solve
            </p>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Open a challenge, read the brief, and start hunting the flag.
          </p>
        </div>
      </div>


    </div>
  );
};

export default Page;
