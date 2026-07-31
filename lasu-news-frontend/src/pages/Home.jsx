import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../api/posts";
import { formatNumber } from "../utils/formatNumber";

// ─── Constants ───────────────────────────────────────────────────────
const CATEGORIES = ["All", "Updates", "Trending", "Opportunities", "Spotlight", "Events"];

const CAMPUSES = ["All", "Ojo", "Epe", "Ikeja"];

const CATEGORY_COLORS = {
  UPDATES: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  TRENDING: "bg-red-50 text-red-700 ring-1 ring-red-100",
  OPPORTUNITIES: "bg-green-50 text-green-700 ring-1 ring-green-100",
  SPOTLIGHT: "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
  EVENTS: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
};

const CAMPUS_COLORS = {
  OJO: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
  EPE: "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  IKEJA: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
};

// ─── Helpers ─────────────────────────────────────────────────────────
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

const getFallbackImage = (title = "") =>
  `https://placehold.co/800x450/f3f4f6/6b7280?text=${encodeURIComponent(
    title.slice(0, 20)
  )}`;

// ─── Sub-components ──────────────────────────────────────────────────

const CategoryBadge = ({ category }) => (
  <span
    className={`inline-flex items-center text-[11px] font-bold uppercase
                tracking-widest px-2.5 py-1 rounded-full
                ${CATEGORY_COLORS[category] ?? CATEGORY_COLORS.UPDATES}`}
  >
    {category}
  </span>
);

const SectionHeader = ({ title, href }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-[#0a0a0a]
                     tracking-tight">
        {title}
      </h2>
    </div>
    {href && (
      <Link
        to={href}
        className="inline-flex items-center gap-2 text-sm font-semibold
                   text-[#e63946] hover:text-red-700 transition-colors
                   group"
      >
        See More
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )}
  </div>
);

const PostCard = ({ article, size = "md" }) => {
  const imgHeights = { sm: "h-36", md: "h-48", lg: "h-56" };
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      to={`/news/${article.slug}`}
      className="bg-white rounded-2xl overflow-hidden group hover:shadow-lg
                 transition-all duration-300 border border-gray-100
                 hover:border-gray-200 h-full flex flex-col"
    >
      <div className="overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={article.coverImage || getFallbackImage(article.title)}
          alt={article.title}
          className={`w-full ${imgHeights[size]} object-cover
                      group-hover:scale-105 transition-transform duration-500
                      ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = getFallbackImage(article.title);
            setImageLoaded(true);
          }}
        />
        {!imageLoaded && (
          <div className={`w-full ${imgHeights[size]} bg-gradient-to-br
                          from-gray-100 to-gray-200 animate-pulse`} />
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <CategoryBadge category={article.category} />
        <h3 className="text-[#0a0a0a] font-bold text-base leading-snug mt-3
                       mb-3 line-clamp-2 group-hover:text-[#e63946]
                       transition-colors flex-1">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3
                        leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-gray-400 text-xs font-medium">
            {formatTimeAgo(article.createdAt)}
          </span>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {formatNumber(article.views || 0)}
          </div>
        </div>
      </div>
    </Link>
  );
};

const SidePostCard = ({ article }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      to={`/news/${article.slug}`}
      className="flex gap-3 bg-white rounded-2xl p-4 group hover:shadow-md
                 transition-all duration-300 border border-gray-100
                 hover:border-gray-200"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0
                      bg-gray-100">
        <img
          src={article.coverImage || getFallbackImage(article.title)}
          alt={article.title}
          className={`w-full h-full object-cover group-hover:scale-105
                      transition-transform duration-300
                      ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = getFallbackImage(article.title);
            setImageLoaded(true);
          }}
        />
        {!imageLoaded && (
          <div className="w-full h-full bg-gradient-to-br from-gray-100
                          to-gray-200 animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <CategoryBadge category={article.category} />
          <p className="text-[#0a0a0a] text-sm font-bold leading-tight mt-1.5
                        line-clamp-2 group-hover:text-[#e63946]
                        transition-colors">
            {article.title}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-400 text-xs font-medium">
            {formatTimeAgo(article.createdAt)}
          </span>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {formatNumber(article.views || 0)}
          </div>
        </div>
      </div>
    </Link>
  );
};

const EmptyState = ({ category }) => (
  <div className="bg-white rounded-2xl border border-gray-100 py-20
                  text-center">
    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center
                    justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor"
        viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1
             1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2
             2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1
             1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0
             01-2 2z" />
      </svg>
    </div>
    <p className="text-lg font-semibold text-gray-700 mb-1">
      No posts in {category} yet
    </p>
    <p className="text-sm text-gray-400">
      Check back soon for updates.
    </p>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100
                  animate-pulse">
    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-16 bg-gray-100 rounded-full" />
      <div className="h-5 bg-gray-100 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-1/2" />
      <div className="h-3 w-20 bg-gray-100 rounded" />
    </div>
  </div>
);

const SkeletonSideCard = () => (
  <div className="flex gap-3 bg-white rounded-2xl p-4 border border-gray-100
                  animate-pulse">
    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100
                    to-gray-200 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-12 bg-gray-100 rounded-full" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-3 w-16 bg-gray-100 rounded" />
    </div>
  </div>
);

// ─── Hero Carousel ────────────────────────────────────────────────────
const HeroCarousel = ({ articles }) => {
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef(null);

  useEffect(() => {
    if (articles.length < 2) return;
    autoplayRef.current = setInterval(
      () => setCurrent((p) => (p + 1) % articles.length),
      6000
    );
    return () => clearInterval(autoplayRef.current);
  }, [articles.length]);

  if (!articles.length) return null;

  const prev = () => {
    setCurrent((p) => (p - 1 + articles.length) % articles.length);
    clearInterval(autoplayRef.current);
  };

  const next = () => {
    setCurrent((p) => (p + 1) % articles.length);
    clearInterval(autoplayRef.current);
  };

  const goToSlide = (index) => {
    setCurrent(index);
    clearInterval(autoplayRef.current);
  };

  return (
    <div className="md:col-span-2 relative rounded-2xl overflow-hidden
                    h-[380px] sm:h-[420px] group">
      {articles.map((article, i) => (
        <Link
          key={article.id}
          to={`/news/${article.slug}`}
          className={`absolute inset-0 transition-opacity duration-700
                      ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={article.coverImage || getFallbackImage(article.title)}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = getFallbackImage(article.title);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90
                          via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20">
            <CategoryBadge category={article.category} />
            <h1 className="text-white font-black text-xl sm:text-3xl leading-tight
                           mt-2 sm:mt-3 mb-2 line-clamp-2">
              {article.title}
            </h1>
            <p className="text-white/70 text-xs sm:text-sm line-clamp-1">
              {formatTimeAgo(article.createdAt)}
              {article.author?.name && ` • by ${article.author.name}`}
            </p>
          </div>
        </Link>
      ))}

      {/* Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex gap-2
                      z-30 opacity-0 group-hover:opacity-100 transition-opacity
                      duration-300">
        {articles.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              goToSlide(i);
            }}
            className={`h-2 rounded-full transition-all duration-300
                        ${
                          i === current
                            ? "bg-white w-6 shadow-lg"
                            : "bg-white/40 w-2 hover:bg-white/60"
                        }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Prev / Next */}
      {articles.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30
                       w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur
                       rounded-full flex items-center justify-center text-white
                       hover:bg-white/40 transition-all duration-200
                       opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30
                       w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur
                       rounded-full flex items-center justify-center text-white
                       hover:bg-white/40 transition-all duration-200
                       opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────
const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawCategory = searchParams.get("category");
  const activeCategory = rawCategory ? rawCategory.toUpperCase() : "All";
  const rawCampus = searchParams.get("campus");
  const activeCampus = rawCampus ? rawCampus.toUpperCase() : "All";
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch home sections
  const { data: heroData, isLoading: heroLoading } = useQuery({
    queryKey: ["posts", "hero"],
    queryFn: () => getPosts({ limit: 5, sort: "latest" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["posts", "trending"],
    queryFn: () => getPosts({ limit: 3, sort: "trending" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ["posts", "latest"],
    queryFn: () => getPosts({ limit: 6, sort: "latest" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ["posts", "weekly"],
    queryFn: () => getPosts({ limit: 3, sort: "weekly" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["posts", "category", activeCategory, "campus", activeCampus],
    queryFn: () =>
      getPosts({ 
        limit: 12, 
        category: activeCategory !== "All" ? activeCategory : undefined,
        campus: activeCampus !== "All" ? activeCampus : undefined,
        sort: "latest" 
      }),
    enabled: activeCategory !== "All" || activeCampus !== "All",
    staleTime: 5 * 60 * 1000,
  });

  const sections = {
    hero: heroData?.posts ?? [],
    trending: trendingData?.posts ?? [],
    latest: latestData?.posts?.slice(0, 3) ?? [],
    featured: latestData?.posts?.[3] ?? null,
    weekly: weeklyData?.posts ?? [],
  };

  const categoryPosts = categoryData?.posts ?? [];
  const sectionsLoading =
    heroLoading || trendingLoading || latestLoading || weeklyLoading;

  const handleCategoryClick = useCallback(
    (cat) => {
      const newParams = new URLSearchParams(searchParams);
      if (cat === "All") {
        newParams.delete("category");
      } else {
        newParams.set("category", cat.toUpperCase());
      }
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchParams, setSearchParams]
  );

  const handleCampusClick = useCallback(
    (camp) => {
      const newParams = new URLSearchParams(searchParams);
      if (camp === "All") {
        newParams.delete("campus");
      } else {
        newParams.set("campus", camp.toUpperCase());
      }
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  // ── Loading ─────────────────────────────────────────────────────
  if (sectionsLoading && !heroData) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center
                      justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-[#e63946]
                          rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">
            Loading latest news...
          </p>
        </div>
      </div>
    );
  }

  const isFiltered = activeCategory !== "All" || activeCampus !== "All";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── Hero ────────────────────────────────────────────────── */}
      {!isFiltered && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8
                            pb-6 sm:pb-8">
          {heroLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 h-[380px] sm:h-[420px]
                              bg-white rounded-2xl border border-gray-100
                              animate-pulse" />
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => (
                  <SkeletonSideCard key={i} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HeroCarousel articles={sections.hero} />
              <div className="flex flex-col gap-3">
                {sections.hero.slice(0, 3).map((article) => (
                  <SidePostCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Category Filter (Sticky) ──────────────────────────────── */}
      <section className="sticky top-0 z-40 bg-[#f8fafc]/95 backdrop-blur-sm
                          border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto
                          scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const value = cat === "All" ? "All" : cat.toUpperCase();
              const isActive = activeCategory === value;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm
                              font-semibold transition-all duration-200
                              ${
                                isActive
                                  ? "bg-[#0a0a0a] text-white shadow-sm"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                              }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          {/* Campus Filter */}
          <div className="flex items-center gap-2 overflow-x-auto
                          scrollbar-hide mt-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
              Campus:
            </span>
            {CAMPUSES.map((camp) => {
              const value = camp === "All" ? "All" : camp.toUpperCase();
              const isActive = activeCampus === value;
              return (
                <button
                  key={camp}
                  onClick={() => handleCampusClick(camp)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs
                              font-semibold transition-all duration-200
                              ${
                                isActive
                                  ? "bg-[#e63946] text-white shadow-sm"
                                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                              }`}
                >
                  {camp}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Category View ────────────────────────────────────────── */}
      {isFiltered ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0a0a0a]
                         tracking-tight mb-6 sm:mb-8">
            {activeCategory !== "All" 
              ? `${activeCategory.charAt(0) + activeCategory.slice(1).toLowerCase()} News`
              : "All News"}
            {activeCampus !== "All" && ` - ${activeCampus} Campus`}
          </h2>

          {categoryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                            gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : categoryPosts.length === 0 ? (
            <EmptyState category={activeCategory} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                            gap-6">
              {categoryPosts.map((article) => (
                <PostCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ── Trending ──────────────────────────────────────────── */}
          {sections.trending.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8
                                sm:py-12">
              <SectionHeader title="Trending Now" href="/news?sort=trending" />
              {trendingLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2
                                md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2
                                md:grid-cols-3 gap-6">
                  {sections.trending.map((a) => (
                    <PostCard key={a.id} article={a} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Latest ────────────────────────────────────────────── */}
          {sections.latest.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8
                                sm:py-12">
              <SectionHeader title="Latest News" href="/news?sort=latest" />
              {latestLoading ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2
                                  md:grid-cols-3 gap-6 mb-8">
                    {[...Array(3)].map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100
                                  h-64 md:h-80 animate-pulse" />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2
                                  md:grid-cols-3 gap-6 mb-8">
                    {sections.latest.map((a) => (
                      <PostCard key={a.id} article={a} />
                    ))}
                  </div>

                  {/* Featured post */}
                  {sections.featured && (
                    <Link
                      to={`/news/${sections.featured.slug}`}
                      className="bg-white rounded-2xl overflow-hidden flex
                                 flex-col md:flex-row group hover:shadow-lg
                                 transition-all duration-300 border
                                 border-gray-100 hover:border-gray-200"
                    >
                      <div className="md:w-2/5 overflow-hidden bg-gray-100
                                      flex-shrink-0">
                        <img
                          src={
                            sections.featured.coverImage ||
                            getFallbackImage(sections.featured.title)
                          }
                          alt={sections.featured.title}
                          className="w-full h-64 md:h-full object-cover
                                     group-hover:scale-105 transition-transform
                                     duration-500"
                          onError={(e) => {
                            e.target.src = getFallbackImage(
                              sections.featured.title
                            );
                          }}
                        />
                      </div>
                      <div className="flex-1 p-6 sm:p-8 flex flex-col
                                      justify-center">
                        <CategoryBadge
                          category={sections.featured.category}
                        />
                        <h2 className="text-[#0a0a0a] font-black text-2xl
                                       sm:text-3xl leading-tight mt-4 mb-4
                                       group-hover:text-[#e63946]
                                       transition-colors">
                          {sections.featured.title}
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base
                                      leading-relaxed line-clamp-3 mb-6">
                          {sections.featured.excerpt}
                        </p>
                        <span className="text-gray-400 text-xs font-medium">
                          {formatTimeAgo(sections.featured.createdAt)}
                          {sections.featured.author?.name &&
                            ` • by ${sections.featured.author.name}`}
                        </span>
                      </div>
                    </Link>
                  )}
                </>
              )}
            </section>
          )}

          {/* ── Weekly Highlights ─────────────────────────────────── */}
          {sections.weekly.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8
                                sm:py-12">
              <SectionHeader
                title="Weekly Highlights"
                href="/news?sort=weekly"
              />
              {weeklyLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2
                                md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2
                                md:grid-cols-3 gap-6">
                  {sections.weekly.map((a) => (
                    <PostCard key={a.id} article={a} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* ── Search CTA Banner ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div
          className="rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative
                     overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          }}
        >
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 opacity-5 pointer-events-none
                          overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full
                            bg-[#e63946] blur-3xl group-hover:blur-2xl
                            transition-all duration-500" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96
                            rounded-full bg-blue-600 blur-3xl
                            group-hover:blur-2xl transition-all duration-500" />
          </div>

          <div className="relative z-10">
            <p className="text-white/40 text-[11px] font-bold tracking-widest
                          uppercase mb-4">
              Stay Connected · Never Miss A Story
            </p>
            <h2 className="text-white font-black text-3xl sm:text-4xl
                           lg:text-5xl leading-tight mb-2">
              DISCOVER THE LATEST
            </h2>
            <h3 className="text-[#e63946] font-black text-3xl sm:text-4xl
                           lg:text-5xl leading-tight mb-8">
              LASU CAMPUS NEWS
            </h3>

            {/* Search input */}
            <div className="flex flex-col sm:flex-row items-center gap-3
                            max-w-2xl mx-auto">
              <div className="w-full flex items-center bg-white/10
                              backdrop-blur rounded-full px-5 py-3.5
                              border border-white/20
                              focus-within:border-white/40
                              transition-colors duration-200">
                <svg className="w-5 h-5 text-white/40 flex-shrink-0"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search articles, topics, news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-transparent text-white text-sm
                             placeholder:text-white/30 focus:outline-none
                             ml-3"
                />
                <button
                  onClick={handleSearch}
                  className="text-white/50 hover:text-white transition-colors
                             ml-2 flex-shrink-0"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Help text */}
            <p className="text-white/30 text-xs mt-4">
              Press Enter or click the search button to explore
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;