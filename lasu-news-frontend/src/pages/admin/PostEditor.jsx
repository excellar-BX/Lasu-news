import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostById, createPost, updatePost } from "../../api/posts";

const categories = [
  "UPDATES",
  "TRENDING",
  "OPPORTUNITIES",
  "SPOTLIGHT",
  "EVENTS",
];

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    category: "UPDATES",
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError]           = useState(null);
  const [coverImageError, setCoverImageError] = useState(false);
  const [success, setSuccess]       = useState(null);

  useEffect(() => { if (isEditing) fetchPost(); }, [id]);

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
      setError("Failed to load post.");
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
    if (name === "coverImage") setCoverImageError(false);
  };

  const validate = () => {
    if (!formData.title.trim())   return "Title is required.";
    if (!formData.excerpt.trim()) return "Excerpt is required.";
    if (!formData.content.trim()) return "Content is required.";
    return null;
  };

  const handleSubmit = async (publishOverride) => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const payload = {
      ...formData,
      published:
        publishOverride !== undefined ? publishOverride : formData.published,
    };

    try {
      publishOverride === false ? setSavingDraft(true) : setSaving(true);
      setError(null);

      if (isEditing) {
        await updatePost(id, payload);
      } else {
        await createPost(payload);
      }

      navigate("/admin/posts");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Unknown error";
      setError(
        isEditing ? `Failed to update: ${msg}` : `Failed to create: ${msg}`
      );
      console.error(err);
    } finally {
      setSaving(false);
      setSavingDraft(false);
    }
  };

  const wordCount = formData.content.trim()
    ? formData.content.trim().split(/\s+/).length
    : 0;
  const excerptCount = formData.excerpt.length;
  const isBusy = saving || savingDraft;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="h-5 w-20 bg-gray-100 rounded" />
              <div className="h-11 bg-gray-100 rounded-xl" />
              <div className="h-5 w-20 bg-gray-100 rounded" />
              <div className="h-20 bg-gray-100 rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="h-64 bg-gray-100 rounded-xl" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 h-36" />
            <div className="bg-white rounded-2xl border border-gray-100 p-5 h-52" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#0a0a0a] tracking-tight">
            {isEditing ? "Edit Post" : "New Post"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEditing
              ? "Make changes and republish when ready."
              : "Fill in the details to publish a new article."}
          </p>
        </div>
        <Link
          to="/admin/posts"
          className="flex items-center gap-1.5 text-sm text-gray-400
                     hover:text-gray-700 font-medium transition-colors
                     hover:underline underline-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Posts
        </Link>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100
                        text-red-700 px-4 py-3.5 rounded-xl text-sm
                        animate-[fadeIn_150ms_ease]">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors
                       flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Main content ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title + Excerpt */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5
                          shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400
                                uppercase tracking-widest mb-2">
                Title <span className="text-[#e63946]">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={isBusy}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl
                           text-[#0a0a0a] font-semibold text-lg
                           placeholder:font-normal placeholder:text-gray-300
                           focus:ring-2 focus:ring-[#e63946]/30
                           focus:border-[#e63946] outline-none transition-all
                           disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Enter a compelling post title..."
              />
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-gray-400
                                  uppercase tracking-widest">
                  Excerpt <span className="text-[#e63946]">*</span>
                </label>
                <span
                  className={`text-[11px] font-semibold tabular-nums
                              transition-colors
                              ${excerptCount > 200
                                ? "text-red-500"
                                : excerptCount > 150
                                ? "text-amber-500"
                                : "text-gray-300"
                              }`}
                >
                  {excerptCount} / 200
                </span>
              </div>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                disabled={isBusy}
                rows={3}
                maxLength={250}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl
                           text-sm text-[#0a0a0a] placeholder:text-gray-300
                           focus:ring-2 focus:ring-[#e63946]/30
                           focus:border-[#e63946] outline-none resize-none
                           transition-all disabled:bg-gray-50
                           disabled:text-gray-400 leading-relaxed"
                placeholder="A short summary shown on post cards and previews..."
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5
                          shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-gray-400
                                uppercase tracking-widest">
                Content <span className="text-[#e63946]">*</span>
              </label>
              <span className="text-[11px] text-gray-300 font-medium
                               tabular-nums">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            </div>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              disabled={isBusy}
              rows={22}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                         text-sm text-[#0a0a0a] font-mono
                         placeholder:font-sans placeholder:text-gray-300
                         focus:ring-2 focus:ring-[#e63946]/30
                         focus:border-[#e63946] outline-none resize-y
                         transition-all disabled:bg-gray-50
                         disabled:text-gray-400 leading-relaxed"
              placeholder="Write your full article content here...

Use blank lines to separate paragraphs."
            />
            <p className="text-[11px] text-gray-300 mt-2">
              Tip: Use blank lines to separate paragraphs.
            </p>
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="space-y-4">
          {/* Publish card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5
                          shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase
                           tracking-widest">
              Publish
            </h3>

            {/* Current status indicator (editing only) */}
            {isEditing && (
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl
                              text-xs font-semibold
                              ${formData.published
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                              }`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0
                                  ${formData.published
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-amber-400"
                                  }`} />
                Currently{" "}
                {formData.published ? "Published & Live" : "Saved as Draft"}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isBusy}
              className="w-full py-2.5 bg-[#e63946] text-white rounded-xl
                         font-semibold text-sm hover:bg-red-700
                         active:scale-[0.98] transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:active:scale-100 flex items-center
                         justify-center gap-2 shadow-sm shadow-red-100"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none"
                    viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditing ? "Update & Publish" : "Publish Now"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isBusy}
              className="w-full py-2.5 border border-gray-200 text-gray-600
                         rounded-xl font-semibold text-sm hover:bg-gray-50
                         active:scale-[0.98] transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:active:scale-100 flex items-center
                         justify-center gap-2"
            >
              {savingDraft ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none"
                    viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0
                         002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3
                         3V4" />
                  </svg>
                  Save as Draft
                </>
              )}
            </button>
          </div>

          {/* Settings card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5
                          shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase
                           tracking-widest">
              Settings
            </h3>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400
                                uppercase tracking-widest mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isBusy}
                className="w-full px-3 py-2.5 border border-gray-200
                           rounded-xl text-sm text-[#0a0a0a]
                           focus:ring-2 focus:ring-[#e63946]/30
                           focus:border-[#e63946] outline-none bg-white
                           transition-all disabled:bg-gray-50
                           disabled:text-gray-400 font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400
                                uppercase tracking-widest mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                disabled={isBusy}
                className="w-full px-3 py-2.5 border border-gray-200
                           rounded-xl text-sm placeholder:text-gray-300
                           focus:ring-2 focus:ring-[#e63946]/30
                           focus:border-[#e63946] outline-none transition-all
                           disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="https://..."
              />

              {/* Preview */}
              {formData.coverImage && !coverImageError && (
                <div className="mt-3 relative group">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-28 object-cover rounded-xl
                               border border-gray-100"
                    onError={() => setCoverImageError(true)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, coverImage: "" }))
                    }
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60
                               text-white rounded-full flex items-center
                               justify-center hover:bg-black/80
                               transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove image"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Image error */}
              {formData.coverImage && coverImageError && (
                <div className="mt-2 flex items-center gap-2 text-[11px]
                                text-red-500">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0
                         0118 0z" />
                  </svg>
                  Could not load image from this URL
                </div>
              )}
            </div>
          </div>

          {/* Danger zone (edit only) */}
          {isEditing && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5
                            shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase
                             tracking-widest mb-3">
                Danger Zone
              </h3>
              <Link
                to="/admin/posts"
                className="w-full flex items-center justify-center gap-2
                           py-2.5 text-sm font-semibold text-red-500
                           border border-red-100 rounded-xl
                           hover:bg-red-50 transition-colors"
              >
                Discard Changes
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostEditor;