import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostBySlug } from "../api/posts";

const Article = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostBySlug(slug);
        setPost(data.post);
      } catch (err) {
        setError("Failed to load article");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Article not found"}</p>
          <Link to="/" className="px-4 py-2 bg-[#e63946] text-white rounded-lg hover:bg-red-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const categoryColors = {
    Sports: "bg-green-100 text-green-700",
    Campus: "bg-blue-100 text-blue-700",
    Politics: "bg-purple-100 text-purple-700",
    General: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-[#e63946] font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Category Badge */}
        <span
          className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${
            categoryColors[post.category] || categoryColors.General
          }`}
        >
          {post.category}
        </span>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-[#0a0a0a] leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#e63946] flex items-center justify-center text-white font-bold">
              {post.author?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="font-semibold text-[#0a0a0a]">{post.author?.name || "Unknown"}</p>
              <p className="text-xs">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8"
          />
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>
        </div>

        {/* Comments Section */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-black text-[#0a0a0a] mb-6">
            Comments ({post.comments?.length || 0})
          </h2>

          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-6">
              {post.comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0">
                      {comment.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-[#0a0a0a]">
                          {comment.user?.name || "Unknown"}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </section>
      </article>
    </div>
  );
};

export default Article;