import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllComments, deleteComment } from "../../api/comments";

// ── Confirm delete modal ──────────────────────────────────────────────────
const DeleteModal = ({ comment, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm
                 animate-[fadeIn_150ms_ease]"
      onClick={onCancel}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full
                    max-w-md animate-[slideInUp_200ms_ease]">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center
                      justify-center mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
               01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1
               1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-[#0a0a0a] mb-1">
        Delete Comment?
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        This action cannot be undone. The comment will be permanently removed.
      </p>
      {comment && (
        <div className="bg-gray-50 rounded-xl p-3 mb-5">
          <p className="text-xs text-gray-400 mb-1">
            {comment.user?.name || "Unknown user"}
          </p>
          <p className="text-sm text-[#0a0a0a] line-clamp-2">
            "{comment.content}"
          </p>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl
                     text-sm font-semibold text-gray-600 hover:bg-gray-50
                     transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-[#e63946] text-white rounded-xl
                     text-sm font-semibold hover:bg-red-700
                     transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────
const Comments = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: commentsData, isLoading, error, isFetching } = useQuery({
    queryKey: ["comments", page],
    queryFn: () => getAllComments({ page, limit: 20 }),
    staleTime: 5 * 60 * 1000,
  });

  const comments = commentsData?.comments || [];
  const totalPages = commentsData?.pagination?.totalPages || 1;
  const total = commentsData?.pagination?.total || 0;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
      setPendingDelete(null);
    },
    onError: (err) => {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment. Please try again.");
    },
  });

  const handleDelete = () => {
    if (pendingDelete) {
      deleteMutation.mutate(pendingDelete.id);
    }
  };

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

  // Client-side search filter
  const filtered = comments.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.content?.toLowerCase().includes(s) ||
      c.user?.name?.toLowerCase().includes(s) ||
      c.post?.title?.toLowerCase().includes(s)
    );
  });

  /* ─── Loading skeleton ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4
                                   border-b border-gray-50 last:border-0
                                   animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Error state ──────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-[#0a0a0a] tracking-tight">
          Comments
        </h1>
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5
                        py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-red-700 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error?.message || "Failed to load comments"}
          </div>
          <button
            onClick={() => queryClient.invalidateQueries(["comments"])}
            className="text-xs font-semibold text-red-600 hover:text-red-800
                       underline underline-offset-2 flex-shrink-0"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Delete modal */}
      {pendingDelete && (
        <DeleteModal
          comment={pendingDelete}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#0a0a0a] tracking-tight">
              Comments
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {total} total comment{total !== 1 ? "s" : ""}
              {filtered.length !== total &&
                ` · ${filtered.length} match${filtered.length !== 1 ? "es" : ""}`}
            </p>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries(["comments"])}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200
                       text-gray-600 rounded-xl font-semibold text-sm
                       hover:bg-gray-50 active:scale-[0.97] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex-shrink-0"
          >
            <svg
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0
                   0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357
                   2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                       text-gray-300 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search comments, users, or posts..."
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
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-gray-300 hover:text-gray-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Empty states ── */}
        {comments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20
                          flex flex-col items-center text-center px-6">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex
                            items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-200" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03
                     8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512
                     15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700 mb-1">No comments yet</p>
            <p className="text-sm text-gray-400">
              Comments from readers will appear here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20
                          flex flex-col items-center text-center px-6">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex
                            items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-200" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700 mb-1">No results found</p>
            <p className="text-sm text-gray-400 mb-4">
              Try adjusting your search.
            </p>
            <button
              onClick={() => setSearch("")}
              className="text-sm font-semibold text-[#e63946] hover:underline
                         underline-offset-2"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden md:block bg-white rounded-2xl border
                            border-gray-100 overflow-hidden
                            shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["User", "Comment", "Post", "Date", ""].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3.5 text-left text-[11px]
                                   font-bold text-gray-400 uppercase
                                   tracking-widest last:text-right"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((comment) => (
                    <tr
                      key={comment.id}
                      className={`group transition-colors hover:bg-gray-50/60
                                  ${deleteMutation.isPending && pendingDelete?.id === comment.id
                                    ? "opacity-40 pointer-events-none"
                                    : ""
                                  }`}
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br
                                          from-blue-100 to-purple-100
                                          flex items-center justify-center
                                          flex-shrink-0 text-sm font-bold
                                          text-blue-600">
                            {comment.user?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0a0a0a]
                                          line-clamp-1">
                              {comment.user?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {comment.user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-sm text-gray-700 line-clamp-2
                                      leading-relaxed">
                          {comment.content}
                        </p>
                      </td>

                      {/* Post */}
                      <td className="px-6 py-4 max-w-[200px]">
                        {comment.post?.slug ? (
                          <Link
                            to={`/news/${comment.post.slug}`}
                            target="_blank"
                            className="text-sm text-[#e63946] hover:underline
                                       font-medium line-clamp-1 inline-flex
                                       items-center gap-1.5 group/link"
                          >
                            {comment.post?.title || "Unknown Post"}
                            <svg className="w-3 h-3 opacity-0 group-hover/link:opacity-100
                                            transition-opacity" fill="none"
                              stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2
                                   2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            No post linked
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-gray-400 font-medium
                                     whitespace-nowrap">
                        {formatTimeAgo(comment.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setPendingDelete(comment)}
                          className="p-1.5 rounded-lg text-gray-300
                                     hover:text-red-600 hover:bg-red-50
                                     transition-colors"
                          title="Delete comment"
                        >
                          <svg className="w-4 h-4" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2
                                 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1
                                 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
                  </span>
                  {filtered.length !== total && (
                    <>
                      {" "}of{" "}
                      <span className="font-semibold text-gray-600">
                        {total}
                      </span>
                    </>
                  )}
                  {" "}comment{filtered.length !== 1 ? "s" : ""}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs font-semibold text-[#e63946]
                               hover:underline underline-offset-2"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden space-y-3">
              {filtered.map((comment) => (
                <div
                  key={comment.id}
                  className={`bg-white rounded-2xl border border-gray-100
                              overflow-hidden transition-opacity
                              ${deleteMutation.isPending && pendingDelete?.id === comment.id
                                ? "opacity-40"
                                : ""
                              }`}
                >
                  <div className="p-4 space-y-3">
                    {/* User */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br
                                      from-blue-100 to-purple-100
                                      flex items-center justify-center
                                      flex-shrink-0 text-sm font-bold
                                      text-blue-600">
                        {comment.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0a0a0a]
                                      line-clamp-1">
                          {comment.user?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatTimeAgo(comment.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>

                    {/* Post link */}
                    {comment.post?.slug && (
                      <Link
                        to={`/news/${comment.post.slug}`}
                        target="_blank"
                        className="text-xs text-[#e63946] hover:underline
                                   font-medium inline-flex items-center gap-1.5"
                      >
                        {comment.post?.title || "View post"}
                        <svg className="w-3 h-3" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2
                               0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    )}
                  </div>

                  {/* Action bar */}
                  <div className="border-t border-gray-50">
                    <button
                      onClick={() => setPendingDelete(comment)}
                      className="w-full flex items-center justify-center gap-2
                                 py-3 text-sm font-semibold text-red-600
                                 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2
                             2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1
                             0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <p className="text-center text-xs text-gray-400 py-2">
                Showing {filtered.length} of {total} comments
              </p>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Page{" "}
                  <span className="font-semibold text-gray-700">{page}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-gray-700">
                    {totalPages}
                  </span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-xl
                               text-sm font-semibold text-gray-600
                               hover:bg-gray-50 active:scale-[0.97]
                               transition-all disabled:opacity-30
                               disabled:cursor-not-allowed
                               disabled:active:scale-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-xl
                               text-sm font-semibold text-gray-600
                               hover:bg-gray-50 active:scale-[0.97]
                               transition-all disabled:opacity-30
                               disabled:cursor-not-allowed
                               disabled:active:scale-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Comments;