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

const AllNews = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const sort = searchParams.get("sort") || "latest";
  const category = searchParams.get("category") || "All";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts({ limit: 100 });
        setPosts(data.posts || []);
      } catch (err) {
        setError("Failed to load posts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter and sort posts
  const filteredPosts = posts.filter(post => {
    if (category === "All") return true;
    return post.category === category;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sort === "trending") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sort === "latest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sort === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const aInWeek = new Date(a.createdAt) >= oneWeekAgo;
      const bInWeek = new Date(b.createdAt) >= oneWeekAgo;
      if (aInWeek && !bInWeek) return -1;
      if (!aInWeek && bInWeek) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const categories = ["All", "Campus", "Politics", "Sports", "General"];

  const getPageTitle = () => {
    if (category !== "All") return `${category} News`;
    if (sort === "trending") return "Trending News";
    if (sort === "weekly") return "Weekly Highlights";
    return "Latest News";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#e63946] text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <h1 className="text-3xl font-black text-[#0a0a0a]">{getPageTitle()}</h1>
        <p className="text-gray-600 mt-2">
          {sortedPosts.length} {sortedPosts.length === 1 ? "article" : "articles"} found
        </p>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === "All") {
                    searchParams.delete("category");
                  } else {
                    searchParams.set("category", cat);
                  }
                  setSearchParams(searchParams);
                }}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  category === cat
                    ? "bg-[#0a0a0a] text-white"
                    : "bg-white text-[#6b7280] hover:bg-gray-100 border border-[#e5e7eb]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                searchParams.set("sort", e.target.value);
                setSearchParams(searchParams);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]"
            >
              <option value="latest">Latest</option>
              <option value="trending">Trending</option>
              <option value="weekly">This Week</option>
            </select>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {sortedPosts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500">No articles found</p>
            <Link
              to="/"
              className="inline-block mt-4 text-[#e63946] font-semibold hover:underline"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="bg-white rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <CategoryBadge category={article.category} />
                  <h3 className="text-[#0a0a0a] font-bold text-base leading-snug mt-2 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 text-[#9ca3af] text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTimeAgo(article.createdAt)}
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
