import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPosts } from "../api/posts";

const CategoryBadge = ({ category }) => {
  const colors = {
    Sports: "bg-green-100 text-green-700",
    Campus: "bg-blue-100 text-blue-700",
    Politics: "bg-purple-100 text-purple-700",
    General: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
        colors[category] || colors.General
      }`}
    >
      {category}
    </span>
  );
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
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

  // Filter posts by search query
  const filteredPosts = posts.filter(post => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    const title = (post.title || "").toLowerCase();
    const excerpt = (post.excerpt || "").toLowerCase();
    const content = (post.content || "").toLowerCase();
    return (
      title.includes(query) ||
      excerpt.includes(query) ||
      content.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mx-auto mb-4"></div>
          <p className="text-gray-600">Searching...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-[#e63946] font-semibold hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <h1 className="text-3xl font-black text-[#0a0a0a]">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Search"}
        </h1>
        <p className="text-gray-600 mt-2">
          {filteredPosts.length} {filteredPosts.length === 1 ? "result" : "results"} found
        </p>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!searchQuery ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500">Enter a search term to find articles</p>
            <Link
              to="/"
              className="inline-block mt-4 text-[#e63946] font-semibold hover:underline"
            >
              Back to Home
            </Link>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500 mb-4">No articles found for "{searchQuery}"</p>
            <p className="text-gray-400 text-sm mb-4">Try different keywords or browse our categories</p>
            <Link
              to="/news"
              className="inline-block text-[#e63946] font-semibold hover:underline"
            >
              Browse All Articles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="bg-white rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 group cursor-pointer hover:shadow-lg transition-shadow"
              >
                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt={article.title || ""}
                    className="w-full sm:w-48 h-48 sm:h-32 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <CategoryBadge category={article.category || "General"} />
                  <h2 className="text-[#0a0a0a] font-bold text-lg sm:text-xl leading-tight mt-2 mb-2 line-clamp-2 group-hover:text-[#e63946] transition-colors">
                    {article.title || "Untitled"}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {article.excerpt || "No excerpt available"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[#9ca3af] text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {article.createdAt ? formatTimeAgo(article.createdAt) : "Unknown date"}
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
