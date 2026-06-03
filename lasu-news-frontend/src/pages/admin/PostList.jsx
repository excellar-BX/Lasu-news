import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllPostsAdmin, deletePost, updatePost } from "../../api/posts";
import { formatNumber } from "../../utils/formatNumber";

const categoryColors = {
  UPDATES:      "bg-blue-50 text-blue-700 ring-blue-100",
  TRENDING:     "bg-red-50 text-red-700 ring-red-100",
  OPPORTUNITIES:"bg-green-50 text-green-700 ring-green-100",
  SPOTLIGHT:    "bg-purple-50 text-purple-700 ring-purple-100",
  EVENTS:       "bg-orange-50 text-orange-700 ring-orange-100",
};

const formatTimeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1)    return "just now";
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

// ── Reusable confirm dialog state helper ──────────────────────────────────────
const useConfirmDelete = (onConfirm) => {
  const [pendingId, setPendingId] = useState(null);
  const request = (id) => setPendingId(id);
  const confirm = () => { onConfirm(pendingId); setPendingId(null); };
  const cancel  = () => setPendingId(null);
  return { pendingId, request, confirm, cancel };
};

// ── Confirm modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full
                    max-w-sm animate-[fadeIn_150ms_ease]">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center
                      justify-center mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858
               L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-[#0a0a0a] mb-1">Delete Post?</h3>
      <p className="text-sm text-gray-500 mb-5">
        This action cannot be undone. The post will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm
                     font-semibold text-gray-600 hover:bg-gray-50
                     transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-[#e63946] text-white rounded-xl text-sm
                     font-semibold hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const PostList = () => {
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [togglingId,   setTogglingId]   = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);

  const deleteConfirm = useConfirmDelete(async (id) => {
    try {
      setDeletingId(id);
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError("Failed to delete post. Please try again.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  });

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPostsAdmin({ limit: 50 });
      setPosts(data.posts || []);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      setTogglingId(id);
      await updatePost(id, { published: !currentStatus });
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, published: !currentStatus } : p))
      );
    } catch (err) {
      setError("Failed to update post status.");
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = posts.filter((p) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(s) ||
      p.author?.name?.toLowerCase().includes(s);
    const matchesCat =
      filterCat === "ALL" || p.category === filterCat;
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "PUBLISHED" && p.published) ||
      (filterStatus === "DRAFT" && !p.published);
    return matchesSearch && matchesCat && matchesStatus;
  });

  const publishedCount = posts.filter((p) => p.published).length;

  /* ─── Loading skeletons ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-24 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-9 w-28 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 flex-1 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-9 w-36 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-9 w-36 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100
                        overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4
                                   border-b border-gray-50 last:border-0
                                   animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0"/>
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
              <div className="h-5 w-20 bg-gray-100 rounded-full" />
              <div className="h-5 w-16 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Confirm modal */}
      {deleteConfirm.pendingId && (
        <ConfirmModal
          onConfirm={deleteConfirm.confirm}
          onCancel={deleteConfirm.cancel}
        />
      )}

      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#0a0a0a] tracking-tight">
              Posts
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {posts.length} total · {publishedCount} published ·{" "}
              {posts.length - publishedCount} drafts
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
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5
                          py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-red-700 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={fetchPosts}
                className="text-xs font-semibold text-red-600
                           hover:text-red-800 underline underline-offset-2"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                         text-gray-300 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search posts or authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200
                         rounded-xl focus:ring-2 focus:ring-[#e63946]/30
                         focus:border-[#e63946] outline-none bg-white
                         placeholder:text-gray-300 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300
                           hover:text-gray-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 text-sm border
                         border-gray-200 rounded-xl focus:ring-2
                         focus:ring-[#e63946]/30 focus:border-[#e63946]
                         outline-none bg-white font-medium text-gray-700
                         transition-all"
            >
              <option value="ALL">All Categories</option>
              {Object.keys(categoryColors).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 text-sm border
                         border-gray-200 rounded-xl focus:ring-2
                         focus:ring-[#e63946]/30 focus:border-[#e63946]
                         outline-none bg-white font-medium text-gray-700
                         transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* ── Empty states ── */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100
                          py-20 flex flex-col items-center text-center px-6">
            {posts.length === 0 ? (
              <>
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex
                                items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-200" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1
                         1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0
                         01-2 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 mb-1">
                  No posts yet
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Get started by creating your first article.
                </p>
                <Link
                  to="/admin/posts/new"
                  className="px-4 py-2 bg-[#e63946] text-white rounded-xl
                             text-sm font-semibold hover:bg-red-700
                             transition-colors"
                >
                  Create First Post
                </Link>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex
                                items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-200" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 mb-1">
                  No results found
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setFilterCat("ALL");
                    setFilterStatus("ALL");
                  }}
                  className="text-sm font-semibold text-[#e63946]
                             hover:underline underline-offset-2"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Desktop Table ── */}
        {filtered.length > 0 && (
          <>
            <div className="hidden md:block bg-white rounded-2xl border
                            border-gray-100 overflow-hidden
                            shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Post", "Category", "Status", "Views", "Date", ""].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3.5 text-left text-[11px]
                                   font-bold text-gray-400 uppercase
                                   tracking-widest ${h === "" ? "last:text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((post) => (
                    <tr
                      key={post.id}
                      className={`group transition-colors hover:bg-gray-50/60
                                  ${deletingId === post.id
                                    ? "opacity-40 pointer-events-none"
                                    : ""
                                  }`}
                    >
                      {/* Post */}
                      <td className="px-6 py-4 max-w-[280px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden
                                          flex-shrink-0 bg-gray-100
                                          border border-gray-100">
                            {post.coverImage ? (
                              <img
                                src={post.coverImage}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.parentElement.innerHTML =
                                    `<div class="w-full h-full flex items-center
                                     justify-center">
                                      <svg class="w-4 h-4 text-gray-300"
                                       fill="none" stroke="currentColor"
                                       viewBox="0 0 24 24">
                                        <path stroke-linecap="round"
                                         stroke-linejoin="round"
                                         stroke-width="1.5"
                                         d="M4 16l4.586-4.586a2 2 0 012.828
                                          0L16 16m-2-2l1.586-1.586a2 2 0
                                          012.828 0L20 14m-6-6h.01M6 20h12a2
                                          2 0 002-2V6a2 2 0 00-2-2H6a2 2 0
                                          00-2 2v12a2 2 0 002 2z"/>
                                      </svg>
                                    </div>`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center
                                              justify-center">
                                <svg className="w-4 h-4 text-gray-300"
                                  fill="none" stroke="currentColor"
                                  viewBox="0 0 24 24">
                                  <path strokeLinecap="round"
                                    strokeLinejoin="round" strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16
                                       16m-2-2l1.586-1.586a2 2 0 012.828
                                       0L20 14m-6-6h.01M6 20h12a2 2 0
                                       002-2V6a2 2 0 00-2-2H6a2 2 0 00-2
                                       2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#0a0a0a]
                                          line-clamp-1 group-hover:text-[#e63946]
                                          transition-colors">
                              {post.title}
                            </p>
                            {post.author?.name && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {post.author.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex text-[11px] font-bold
                                      px-2.5 py-1 rounded-full ring-1
                                      ${categoryColors[post.category]
                                        || "bg-gray-50 text-gray-600 ring-gray-100"
                                      }`}
                        >
                          {post.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5
                                      text-[11px] font-bold px-2.5 py-1
                                      rounded-full
                                      ${post.published
                                        ? "bg-green-50 text-green-700"
                                        : "bg-amber-50 text-amber-700"
                                      }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                                        ${post.published
                                          ? "bg-green-500 animate-pulse"
                                          : "bg-amber-400"
                                        }`}
                          />
                          {post.published ? "Live" : "Draft"}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {formatNumber(post.views || 0)}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-gray-400
                                     font-medium whitespace-nowrap">
                        {formatTimeAgo(post.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle publish */}
                          <button
                            onClick={() =>
                              handleTogglePublish(post.id, post.published)
                            }
                            disabled={togglingId === post.id}
                            title={post.published ? "Unpublish" : "Publish"}
                            className={`px-3 py-1.5 rounded-lg text-[11px]
                                        font-bold transition-colors
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                        ${post.published
                                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                          : "bg-green-50 text-green-700 hover:bg-green-100"
                                        }`}
                          >
                            {togglingId === post.id
                              ? "..."
                              : post.published
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          {/* View */}
                          <Link
                            to={`/news/${post.slug}`}
                            target="_blank"
                            title="View live"
                            className="p-1.5 rounded-lg text-gray-300
                                       hover:text-gray-600 hover:bg-gray-100
                                       transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none"
                              stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478
                                   0 8.268 2.943 9.542 7-1.274 4.057-5.064
                                   7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>

                          {/* Edit */}
                          <Link
                            to={`/admin/posts/edit/${post.id}`}
                            title="Edit"
                            className="p-1.5 rounded-lg text-gray-300
                                       hover:text-blue-600 hover:bg-blue-50
                                       transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none"
                              stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2
                                   2 0 002-2v-5m-1.414-9.414a2 2 0 112.828
                                   2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => deleteConfirm.request(post.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-gray-300
                                       hover:text-red-600 hover:bg-red-50
                                       transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none"
                              stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2
                                   2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1
                                   1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50
                              flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-gray-600">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-600">
                    {posts.length}
                  </span>{" "}
                  posts
                </p>
                {(search || filterCat !== "ALL" || filterStatus !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilterCat("ALL");
                      setFilterStatus("ALL");
                    }}
                    className="text-xs font-semibold text-[#e63946]
                               hover:underline underline-offset-2"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden space-y-3">
              {filtered.map((post) => (
                <div
                  key={post.id}
                  className={`bg-white rounded-2xl border border-gray-100
                              overflow-hidden transition-opacity
                              ${deletingId === post.id ? "opacity-40" : ""}`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden
                                    flex-shrink-0 bg-gray-100 border
                                    border-gray-100">
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
                          <svg className="w-5 h-5 text-gray-300" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2
                                 l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01
                                 M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0
                                 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#0a0a0a]
                                    line-clamp-2 leading-snug">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5
                                      flex-wrap">
                        <span
                          className={`inline-flex text-[10px] font-bold
                                      px-2 py-0.5 rounded-full ring-1
                                      ${categoryColors[post.category]
                                        || "bg-gray-50 text-gray-600 ring-gray-100"
                                      }`}
                        >
                          {post.category}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1
                                      text-[10px] font-bold px-2 py-0.5
                                      rounded-full
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
                        <div className="flex items-center gap-1 text-gray-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {formatNumber(post.views || 0)}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile action bar */}
                  <div className="border-t border-gray-50 grid grid-cols-4
                                  divide-x divide-gray-50">
                    <button
                      onClick={() =>
                        handleTogglePublish(post.id, post.published)
                      }
                      disabled={togglingId === post.id}
                      className={`flex items-center justify-center gap-1.5
                                  py-3 text-[11px] font-bold transition-colors
                                  disabled:opacity-50
                                  ${post.published
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-green-600 hover:bg-green-50"
                                  }`}
                    >
                      {togglingId === post.id ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none"
                          viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12"
                            r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : post.published ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
                                 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563
                                 -3.029m5.858.908a3 3 0 114.243 4.243M9.878
                                 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532
                                 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953
                                 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025
                                 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                          Hide
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7" />
                          </svg>
                          Publish
                        </>
                      )}
                    </button>

                    <Link
                      to={`/news/${post.slug}`}
                      target="_blank"
                      className="flex items-center justify-center py-3
                                 text-gray-400 hover:text-gray-600
                                 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
                             8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
                             7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>

                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="flex items-center justify-center py-3
                                 text-gray-400 hover:text-blue-600
                                 hover:bg-blue-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0
                             002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
                             15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>

                    <button
                      onClick={() => deleteConfirm.request(post.id)}
                      className="flex items-center justify-center py-3
                                 text-gray-400 hover:text-red-600
                                 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2
                             0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0
                             00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <p className="text-center text-xs text-gray-400 py-2">
                Showing {filtered.length} of {posts.length} posts
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PostList;