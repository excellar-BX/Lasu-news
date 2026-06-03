import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

const SearchResults = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPosts({ limit: 100 });
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query)
    );
  });

  /* ─── Loading skeleton ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-8">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
          <div className="h-8 w-64 bg-gray-100 rounded-xl animate-pulse mb-2" />
          <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
        </section>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100
                                   p-5 flex gap-4 animate-pulse">
              <div className="w-32 h-24 bg-gray-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-20 bg-gray-100 rounded-full" />
                <div className="h-5 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
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
            Search Failed
          </h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5
                       bg-[#e63946] text-white rounded-xl font-semibold
                       text-sm hover:bg-red-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      {/* ── Header ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-[#0a0a0a]
                       tracking-tight">
          {searchQuery ? (
            <>
              Search Results for{" "}
              <span className="text-[#e63946]">"{searchQuery}"</span>
            </>
          ) : (
            "Search"
          )}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          {filteredPosts.length}{" "}
          {filteredPosts.length === 1 ? "result" : "results"} found
        </p>
      </section>

      {/* ── Results ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        {!searchQuery ? (
          <div className="bg-white rounded-2xl border border-gray-100
                          py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex
                            items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-200" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enter a search term to find articles
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
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100
                          py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex
                            items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-200" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              No results for "{searchQuery}"
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Try different keywords or browse our categories
            </p>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold
                         text-[#e63946] hover:underline underline-offset-2"
            >
              Browse All Articles
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col
                           sm:flex-row gap-4 group cursor-pointer
                           hover:shadow-lg transition-all duration-300
                           border border-gray-100 hover:border-gray-200"
              >
                {article.coverImage && (
                  <div className="w-full sm:w-48 h-40 sm:h-32 rounded-xl
                                  overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover
                                 group-hover:scale-105 transition-transform
                                 duration-500"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CategoryBadge category={article.category} />
                  <h2 className="text-[#0a0a0a] font-bold text-lg sm:text-xl
                                 leading-tight mt-2 mb-2 line-clamp-2
                                 group-hover:text-[#e63946] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3
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

export default SearchResults;