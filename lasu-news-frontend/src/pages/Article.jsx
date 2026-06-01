import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostBySlug } from "../api/posts";
import { addComment, deleteComment } from "../api/comments";
import { useAuth } from "../context/AuthContext";

const categoryColors = {
  UPDATES: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  TRENDING: "bg-red-50 text-red-700 ring-1 ring-red-100",
  OPPORTUNITIES: "bg-green-50 text-green-700 ring-1 ring-green-100",
  SPOTLIGHT: "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
  EVENTS: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
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
    year: "numeric",
  });
};

// ── Delete comment modal ──────────────────────────────────────────────
const DeleteCommentModal = ({ comment, onConfirm, onCancel }) => (
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
        This action cannot be undone.
      </p>
      {comment && (
        <div className="bg-gray-50 rounded-xl p-3 mb-5">
          <p className="text-xs text-gray-400 mb-1">
            {comment.user?.name || "Unknown"}
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

const Article = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  // Fetch post
  const { data: postData, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const post = postData?.post;

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }) => addComment(postId, content),
    onSuccess: (data) => {
      queryClient.setQueryData(["post", slug], (oldData) => ({
        ...oldData,
        post: {
          ...oldData.post,
          comments: [...(oldData.post.comments || []), data.comment],
        },
      }));
      setCommentContent("");
    },
    onError: (err) => {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment. Please try again.");
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: (_, commentId) => {
      queryClient.setQueryData(["post", slug], (oldData) => ({
        ...oldData,
        post: {
          ...oldData.post,
          comments: oldData.post.comments.filter((c) => c.id !== commentId),
        },
      }));
      setPendingDelete(null);
    },
    onError: (err) => {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment. Please try again.");
    },
  });

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentContent.trim() || !post) return;
    addCommentMutation.mutate({
      postId: post.id,
      content: commentContent.trim(),
    });
  };

  const handleDeleteComment = () => {
    if (pendingDelete) {
      deleteCommentMutation.mutate(pendingDelete.id);
    }
  };

  /* ─── Loading skeleton ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
          </div>
        </header>
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </article>
      </div>
    );
  }

  /* ─── Error state ──────────────────────────────────────────────────── */
  if (error || !post) {
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
            Article Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {error?.message || "This article doesn't exist or has been removed."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e63946]
                       text-white rounded-xl font-semibold text-sm
                       hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Delete modal */}
      {pendingDelete && (
        <DeleteCommentModal
          comment={pendingDelete}
          onConfirm={handleDeleteComment}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <div className="min-h-screen bg-[#f8fafc]">
        {/* ── Header ── */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold
                         text-gray-500 hover:text-[#e63946] transition-colors
                         group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5
                              transition-transform" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </header>

        {/* ── Article ── */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Category */}
          <span
            className={`inline-flex items-center text-[11px] font-bold
                        uppercase tracking-widest px-3 py-1.5 rounded-full
                        ${categoryColors[post.category] || categoryColors.UPDATES}`}
          >
            {post.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black
                         text-[#0a0a0a] leading-tight mt-4 mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b
                          border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br
                              from-red-500 to-orange-500 flex items-center
                              justify-center text-white font-bold text-lg
                              flex-shrink-0">
                {post.author?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0a0a0a]">
                  {post.author?.name || "Unknown Author"}
                </p>
                <p className="text-xs text-gray-400">
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-10 rounded-2xl overflow-hidden
                            shadow-lg shadow-gray-200/50">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-16">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line
                            text-base sm:text-lg">
              {post.content}
            </div>
          </div>

          {/* ── Comments Section ── */}
          <section className="pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-black text-[#0a0a0a] mb-6">
              Comments ({post.comments?.length || 0})
            </h2>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="bg-white rounded-2xl border border-gray-100
                                p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br
                                    from-blue-500 to-purple-500
                                    flex items-center justify-center
                                    text-white font-bold text-sm flex-shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="flex-1 px-4 py-3 border border-gray-200
                                 rounded-xl resize-none focus:ring-2
                                 focus:ring-[#e63946]/30 focus:border-[#e63946]
                                 outline-none transition-all text-sm
                                 placeholder:text-gray-300"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        addCommentMutation.isPending || !commentContent.trim()
                      }
                      className="px-5 py-2.5 bg-[#e63946] text-white rounded-xl
                                 font-semibold text-sm hover:bg-red-700
                                 active:scale-[0.97] transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 disabled:active:scale-100 flex items-center
                                 gap-2"
                    >
                      {addCommentMutation.isPending ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none"
                            viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12"
                              r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Posting...
                        </>
                      ) : (
                        "Post Comment"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-8 bg-gray-50 border border-gray-100
                              rounded-2xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Please{" "}
                  <Link
                    to="/login"
                    className="text-[#e63946] font-semibold hover:underline"
                  >
                    log in
                  </Link>{" "}
                  to leave a comment.
                </p>
              </div>
            )}

            {/* Comments List */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`bg-white rounded-2xl border border-gray-100
                                p-5 shadow-sm transition-opacity
                                ${deleteCommentMutation.isPending &&
                                  pendingDelete?.id === comment.id
                                  ? "opacity-40"
                                  : ""
                                }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br
                                      from-blue-100 to-purple-100
                                      flex items-center justify-center
                                      text-blue-600 font-bold text-sm
                                      flex-shrink-0">
                        {comment.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between
                                        gap-4 mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-[#0a0a0a]">
                              {comment.user?.name || "Unknown"}
                            </p>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          {(user?.id === comment.userId ||
                            user?.role === "ADMIN") && (
                            <button
                              onClick={() => setPendingDelete(comment)}
                              className="text-xs font-semibold text-red-500
                                         hover:text-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100
                              py-16 text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl
                                flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-300" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03
                         8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512
                         15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </section>
        </article>
      </div>
    </>
  );
};

export default Article;