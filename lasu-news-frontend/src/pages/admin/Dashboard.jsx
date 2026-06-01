import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllPostsAdmin } from "../../api/posts";

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

const StatCard = ({ label, value, icon, color, loading }) => {
  const colorMap = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-500",   ring: "ring-blue-100"   },
    green:  { bg: "bg-green-50",  icon: "text-green-500",  ring: "ring-green-100"  },
    yellow: { bg: "bg-yellow-50", icon: "text-yellow-500", ring: "ring-yellow-100" },
  };
  const c = colorMap[color];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]
                    border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                    transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {label}
          </p>
          {loading ? (
            <div className="h-9 w-16 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <p className="text-4xl font-black text-[#0a0a0a] leading-none
                          tabular-nums tracking-tight">
              {value}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 ${c.bg} ring-4 ${c.ring} rounded-xl
                         flex items-center justify-center flex-shrink-0`}>
          <span className={c.icon}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPostsAdmin({ limit: 1000 });
      const posts = data.posts || [];
      const total = data.pagination?.total || posts.length;

      setStats({
        totalPosts: total,
        publishedPosts: posts.filter((p) => p.published).length,
        draftPosts: posts.filter((p) => !p.published).length,
      });
      setRecentPosts(posts.slice(0, 5));
    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0a0a0a]
                         tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening with your news site.
          </p>
        </div>
        <Link
          to="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e63946]
                     text-white rounded-xl font-semibold text-sm
                     hover:bg-red-700 active:scale-[0.97] transition-all
                     shadow-sm shadow-red-200 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      {/* ── Error ── */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4
                        flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-red-700 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
          <button
            onClick={fetchStats}
            className="text-xs font-semibold text-red-600 hover:text-red-800
                       underline underline-offset-2 flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Posts"
          value={stats.totalPosts}
          loading={loading}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={1.75}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012
                   2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0
                   00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          }
        />
        <StatCard
          label="Published"
          value={stats.publishedPosts}
          loading={loading}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Drafts"
          value={stats.draftPosts}
          loading={loading}
          color="yellow"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={1.75}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0
                   002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
                   15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5
                      shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="text-sm font-bold text-[#0a0a0a] uppercase tracking-wider
                       mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/admin/posts/new"
            className="flex items-center gap-4 p-4 border border-gray-100
                       rounded-xl hover:border-[#e63946] hover:bg-red-50/50
                       transition-all duration-150 group active:scale-[0.98]"
          >
            <div className="w-10 h-10 bg-[#e63946] rounded-xl flex
                            items-center justify-center flex-shrink-0
                            group-hover:scale-105 transition-transform duration-150
                            shadow-sm shadow-red-200">
              <svg className="w-5 h-5 text-white" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-[#0a0a0a]">
                Create New Post
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Write and publish a new article
              </p>
            </div>
          </Link>

          <Link
            to="/admin/posts"
            className="flex items-center gap-4 p-4 border border-gray-100
                       rounded-xl hover:border-blue-500 hover:bg-blue-50/50
                       transition-all duration-150 group active:scale-[0.98]"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex
                            items-center justify-center flex-shrink-0
                            group-hover:scale-105 transition-transform duration-150
                            shadow-sm shadow-blue-200">
              <svg className="w-5 h-5 text-white" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1
                     1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0
                     01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-[#0a0a0a]">
                Manage Posts
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Edit, delete, or publish posts
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Recent Posts ── */}
      <div className="bg-white rounded-2xl border border-gray-100
                      shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-gray-50">
          <h2 className="text-sm font-bold text-[#0a0a0a] uppercase
                         tracking-wider">
            Recent Posts
          </h2>
          <Link
            to="/admin/posts"
            className="text-xs font-semibold text-[#e63946]
                       hover:text-red-700 transition-colors flex items-center
                       gap-1 group"
          >
            View All
            <svg className="w-3 h-3 group-hover:translate-x-0.5
                            transition-transform" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="divide-y divide-gray-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4
                                     animate-pulse">
                <div className="w-11 h-11 bg-gray-100 rounded-xl
                                flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && recentPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16
                          text-center px-5">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex
                            items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1
                     1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0
                     01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium">No posts yet</p>
            <Link
              to="/admin/posts/new"
              className="mt-3 text-xs font-semibold text-[#e63946]
                         hover:underline"
            >
              Create your first post →
            </Link>
          </div>
        )}

        {/* List */}
        {!loading && recentPosts.length > 0 && (
          <div className="divide-y divide-gray-50">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/admin/posts/edit/${post.id}`}
                className="flex items-center gap-4 px-5 py-4
                           hover:bg-gray-50/70 transition-colors group"
              >
                {/* Thumbnail — always same width, conditionally show image */}
                <div className="w-11 h-11 rounded-xl overflow-hidden
                                flex-shrink-0 bg-gray-100 border border-gray-100">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center
                                    justify-center">
                      <svg className="w-4 h-4 text-gray-300" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2
                             l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6
                             20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2
                             2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0a0a0a]
                                line-clamp-1 group-hover:text-[#e63946]
                                transition-colors">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {post.category && (
                      <span className="font-medium text-gray-500">
                        {post.category}
                      </span>
                    )}
                    {post.category && " · "}
                    {formatTimeAgo(post.createdAt)}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px]
                              font-semibold px-2.5 py-1 rounded-full flex-shrink-0
                              ${post.published
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                              }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full
                                ${post.published
                                  ? "bg-green-500"
                                  : "bg-amber-400"
                                }`}
                  />
                  {post.published ? "Live" : "Draft"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;