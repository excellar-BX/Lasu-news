import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostById, createPost, updatePost } from "../../api/posts";

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    category: "General",
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id, isEditing]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await getPostById(id);
      const post = data.post;
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage || "",
        category: post.category,
        published: post.published,
      });
    } catch (err) {
      setError("Failed to load post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.excerpt || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEditing) {
        await updatePost(id, formData);
      } else {
        await createPost(formData);
      }

      navigate("/admin/posts");
    } catch (err) {
      setError(isEditing ? "Failed to update post" : "Failed to create post");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const categories = ["Campus", "Politics", "Sports", "General"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e63946]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">
          {isEditing ? "Edit Post" : "Create New Post"}
        </h1>
        <Link
          to="/admin/posts"
          className="text-gray-600 hover:text-[#e63946] font-semibold"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none"
            placeholder="Enter post title"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none"
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
            Cover Image URL
          </label>
          <input
            type="url"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none"
            placeholder="https://example.com/image.jpg"
          />
          {formData.coverImage && (
            <img
              src={formData.coverImage}
              alt="Preview"
              className="mt-3 w-full h-48 object-cover rounded-lg"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
            Excerpt *
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none resize-none"
            placeholder="Brief summary of the post"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={15}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none resize-none font-mono"
            placeholder="Write your post content here..."
            required
          />
        </div>

        {/* Published Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="published"
            id="published"
            checked={formData.published}
            onChange={handleChange}
            className="w-5 h-5 text-[#e63946] border-gray-300 rounded focus:ring-[#e63946]"
          />
          <label htmlFor="published" className="text-sm font-semibold text-[#0a0a0a]">
            Publish immediately
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#e63946] text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
          </button>
          <Link
            to="/admin/posts"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;