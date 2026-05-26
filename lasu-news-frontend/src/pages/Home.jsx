import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getPosts } from "../api/posts";

// ─── Helper Components ───────────────────────────────────────────────
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

const SectionHeader = ({ title, href }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-xl font-black text-[#0a0a0a] tracking-tight">{title}</h2>
    {href && (
      <Link
        to={href}
        className="text-sm text-[#e63946] font-semibold hover:underline flex items-center gap-1"
      >
        See More
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )}
  </div>
);

// ─── Helper Functions ───────────────────────────────────────────────
const formatTimeAgo = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

// ─── Category Filter Bar ─────────────────────────────────────────────
const categories = ["All", "Campus", "Politics", "Sports", "General"];

// ─── Main Component ──────────────────────────────────────────────────
const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts({ limit: 20 });
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

  // Handle URL query parameters
  useEffect(() => {
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");

    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory("All");
    }
  }, [searchParams]);

  // Filter posts by category
  const filteredPosts = posts.filter(post => {
    return activeCategory === "All" || post.category === activeCategory;
  });

  // Sort posts based on query parameter
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const sort = searchParams.get("sort");
    if (sort === "trending") {
      // Sort by views (if available) or just use default
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sort === "latest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sort === "weekly") {
      // Filter to last 7 days and sort by date
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

  // Extract sections from posts
  const heroArticle = sortedPosts[0] || null;
  const sideArticles = sortedPosts.slice(1, 4);
  const trendingArticles = sortedPosts.slice(4, 7);
  const latestArticles = sortedPosts.slice(7, 10);
  const featuredArticle = sortedPosts[10] || null;
  const weeklyHighlights = sortedPosts.slice(11, 14);

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

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Main hero card */}
          {heroArticle && (
            <Link to={`/news/${heroArticle.slug}`} className="md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src={heroArticle.coverImage}
                alt={heroArticle.title}
                className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <CategoryBadge category={heroArticle.category} />
                <h1 className="text-white font-black text-2xl md:text-3xl leading-tight mt-2 mb-3">
                  {heroArticle.title}
                </h1>
                <span className="text-white/50 text-xs">{formatTimeAgo(heroArticle.createdAt)}</span>
              </div>
            </Link>
          )}

          {/* Side articles */}
          <div className="flex flex-col gap-3">
            {sideArticles.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="flex gap-3 bg-white rounded-xl p-3 group cursor-pointer hover:shadow-md transition-shadow"
              >
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-20 h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="flex-1 min-w-0">
                  <CategoryBadge category={article.category} />
                  <p className="text-[#0a0a0a] text-sm font-bold leading-tight mt-1 line-clamp-2">
                    {article.title}
                  </p>
                  <span className="text-[#9ca3af] text-xs mt-1 block">{formatTimeAgo(article.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Filter ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                if (cat === "All") {
                  searchParams.delete("category");
                } else {
                  searchParams.set("category", cat);
                }
                setSearchParams(searchParams);
              }}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-[#0a0a0a] text-white"
                  : "bg-white text-[#6b7280] hover:bg-gray-100 border border-[#e5e7eb]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Trending News ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader title="Trending News" href="/?sort=trending" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {trendingArticles.map((article) => (
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
              <div className="p-4">
                <CategoryBadge category={article.category} />
                <h3 className="text-[#0a0a0a] font-bold text-sm leading-snug mt-2 mb-3 line-clamp-2">
                  {article.title}
                </h3>
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
      </section>

      {/* ── Breaking Banner ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div
          className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#e63946] blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#0a2463] blur-3xl" />
          </div>
          <div className="relative z-10">
            <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">
              Delivering Real-Time Updates and the Latest Headlines Daily
            </p>
            <h2 className="text-white font-black text-3xl md:text-5xl leading-tight mb-2">
              LATEST UPDATES ON
            </h2>
            <h2 className="text-[#e63946] font-black text-3xl md:text-5xl leading-tight mb-8">
              LASU CAMPUS NEWS
            </h2>
            <div className="flex items-center max-w-md mx-auto bg-white/10 backdrop-blur rounded-full px-5 py-3.5 border border-white/20 focus-within:border-white/40 transition-colors">
              <input
                type="text"
                placeholder="Find the topic you want now!"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none"
              />
              <button 
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest News ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader title="Latest News" href="/news?sort=latest" />

        {/* Top 3 image cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-6">
          {latestArticles.map((article) => (
            <Link
              key={article.id}
              to={`/news/${article.slug}`}
              className="bg-white rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="overflow-hidden">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <CategoryBadge category={article.category} />
                <h3 className="text-[#0a0a0a] font-bold text-sm leading-snug mt-2 mb-3 line-clamp-2">
                  {article.title}
                </h3>
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

        {/* Featured wide card */}
        {featuredArticle && (
          <Link to={`/news/${featuredArticle.slug}`} className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row group cursor-pointer hover:shadow-lg transition-shadow">
            <div className="md:w-2/5 overflow-hidden">
              <img
                src={featuredArticle.coverImage}
                alt={featuredArticle.title}
                className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex-1 p-8 flex flex-col justify-center">
              <div>
                <CategoryBadge category={featuredArticle.category} />
              </div>
              <h2 className="text-[#0a0a0a] font-black text-2xl md:text-3xl leading-tight mt-3 mb-4">
                {featuredArticle.title}
              </h2>
              <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-4">
                {featuredArticle.excerpt}
              </p>
              <div className="flex items-center gap-1.5 text-[#9ca3af] text-xs mt-5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTimeAgo(featuredArticle.createdAt)}
              </div>
            </div>
          </Link>
        )}
      </section>

      {/* ── Weekly Highlights ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader title="Weekly Highlights" href="/news?sort=weekly" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {weeklyHighlights.map((article) => (
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
              <div className="p-4">
                <CategoryBadge category={article.category} />
                <h3 className="text-[#0a0a0a] font-bold text-sm leading-snug mt-2 line-clamp-2">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-[#0a0a0a] text-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-1 mb-4">
                <span className="font-black text-2xl tracking-tighter">LASU</span>
                <span className="text-[#e63946] font-black text-2xl tracking-tighter">.NEWS</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                Stay Informed. Stay Ahead with Breaking News and In-Depth Coverage.
              </p>
              <div className="flex items-center gap-3">
                {["twitter", "facebook", "instagram", "linkedin"].map((s) => (
                  <button
                    key={s}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <span className="sr-only">{s}</span>
                    <div className="w-3.5 h-3.5 bg-white/60 rounded-sm" />
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "Contact",
                links: ["Email", "Phone", "Address", "Call center"],
              },
              {
                title: "Categories",
                links: ["Campus", "Politics", "Sports", "General"],
              },
              {
                title: "Follow Us",
                links: ["Facebook", "Instagram", "Pinterest", "Twitter"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm mb-4 tracking-wide">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-white/40 hover:text-white text-sm cursor-pointer transition-colors">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">
              All rights reserved © {new Date().getFullYear()} LASU News
            </p>
            <div className="flex items-center gap-6 text-white/30 text-xs">
              <span>📞 +1 234-567-890</span>
              <span>📍 Lagos State, Nigeria</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;