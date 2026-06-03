import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../api/posts";
import { formatNumber } from "../utils/formatNumber";

const categoryColors = {
  UPDATES: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  TRENDING: "bg-red-50 text-red-700 ring-1 ring-red-100",
  OPPORTUNITIES: "bg-green-50 text-green-700 ring-1 ring-green-100",
  SPOTLIGHT: "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
  EVENTS: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
};

const CategoryBadge = ({ category }) => (
  <span
    className={`inline-flex items-center text-[11px] font-bold uppercase
                tracking-widest px-2.5 py-1 rounded-full
                ${categoryColors[category] || categoryColors.UPDATES}`}
  >
    {category}
  </span>
);

const formatTimeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const AllNews = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get("sort") || "latest";
  const category = searchParams.get("category")?.toUpperCase() || "ALL";

  const queryParams = { limit: 100 };
  if (category !== "ALL") queryParams.category = category;
  if (sort) queryParams.sort = sort;

  const { data: postsData, isLoading, error, isFetching } = useQuery({
    queryKey: ["posts", "all", category, sort],
    queryFn: () => getPosts(queryParams),
    staleTime: 5 * 60 * 1000,
  });

  const posts = postsData?.posts || [];

  const categories = [
    "ALL",
    "UPDATES",
    "TRENDING",
    "OPPORTUNITIES",
    "SPOTLIGHT",
    "EVENTS",
  ];

  const getPageTitle = () => {
    if (category !== "ALL") return `${category.charAt(0) + category.slice(1).toLowerCase()} News`;
    if (sort === "trending") return "Trending News";
    if (sort === "weekly") return "Weekly Highlights";
    return "Latest News";
  };

  /* ─── Loading skeleton ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-8">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
          <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse mb-2" />
          <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
          <div className="flex gap-3 mb-4 overflow-x-auto scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-9 w-24 bg-gray-100 rounded-full
                                     animate-pulse flex-shrink-0" />
            ))}
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden
                                     border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-16 bg-gray-100 rounded-full" />
                  <div className="h-5 bg-gray-100 rounded" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  /* ─── Error state ──────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center
                      justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8
                        max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center
                          justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#0a0a0a] mb-2">
            Failed to Load
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {error?.message || "Unable to load posts. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#e63946] text-white rounded-xl
                       font-semibold text-sm hover:bg-red-700
                       transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      {/* ── Header ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-[#0a0a0a]
                       tracking-tight">
          {getPageTitle()}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          {posts.length} {posts.length === 1 ? "article" : "articles"} found
          {isFetching && (
            <span className="ml-2 text-[#e63946]">• Refreshing...</span>
          )}
        </p>
      </section>

      {/* ── Filters ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 border-b
                          border-gray-100 sticky top-0 bg-[#f8fafc]/95
                          backdrop-blur-sm z-30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center
                        gap-4">
          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto
                          scrollbar-hide w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === "ALL") {
                    searchParams.delete("category");
                  } else {
                    searchParams.set("category", cat);
                  }
                  setSearchParams(searchParams);
                }}
                className={`shrink-0 px-4 py-2 rounded-full text-sm
                            font-semibold transition-all
                            ${category === cat
                              ? "bg-[#0a0a0a] text-white shadow-sm"
                              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Sort filter */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs text-gray-400 font-medium uppercase
                             tracking-wider">
              Sort:
            </span>
            <select
              value={sort}
              onChange={(e) => {
                searchParams.set("sort", e.target.value);
                setSearchParams(searchParams);
              }}
              className="px-3 py-2 rounded-xl border border-gray-200
                         bg-white text-sm font-medium text-gray-700
                         focus:ring-2 focus:ring-[#e63946]/30
                         focus:border-[#e63946] outline-none transition-all"
            >
              <option value="latest">Latest</option>
              <option value="trending">Trending</option>
              <option value="weekly">This Week</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Posts Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100
                          py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex
                            items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-200" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1
                     1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0
                     01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              No articles found
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Try adjusting your filters or browse all news.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold
                         text-[#e63946] hover:underline underline-offset-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                          gap-6">
            {posts.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="bg-white rounded-2xl overflow-hidden group
                           cursor-pointer hover:shadow-lg transition-all
                           duration-300 border border-gray-100
                           hover:border-gray-200"
              >
                {article.coverImage && (
                  <div className="overflow-hidden bg-gray-100">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-48 object-cover
                                 group-hover:scale-105 transition-transform
                                 duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <CategoryBadge category={article.category} />
                  <h3 className="text-[#0a0a0a] font-bold text-base
                                 leading-snug mt-3 mb-3 line-clamp-2
                                 group-hover:text-[#e63946] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4
                                leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between gap-3 text-gray-400
                                  text-xs">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTimeAgo(article.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatNumber(article.views || 0)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AllNews;