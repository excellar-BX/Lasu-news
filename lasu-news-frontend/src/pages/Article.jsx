import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getPostBySlug } from "../api/posts";
import { addComment, deleteComment } from "../api/comments";
import { useAuth } from "../context/AuthContext";

// ── Constants ────────────────────────────────────────────────────────
const SITE_NAME = "LASU News";
const SITE_URL  = "https://lasunews.com.ng";
const TWITTER_HANDLE = "@lasunewsng";
const FALLBACK_OG_IMAGE = `${SITE_URL}/logo.jpg`; // 1200×630 default

const categoryColors = {
  UPDATES:      "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  TRENDING:     "bg-red-50 text-red-700 ring-1 ring-red-100",
  OPPORTUNITIES:"bg-green-50 text-green-700 ring-1 ring-green-100",
  SPOTLIGHT:    "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
  EVENTS:       "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
};

const campusColors = {
  OJO:   "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
  EPE:   "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  IKEJA: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
};

// ── Helpers ──────────────────────────────────────────────────────────
const formatTimeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1)     return "just now";
  if (diff < 60)    return `${diff}m ago`;
  if (diff < 1440)  return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

/** Strip markdown/extra whitespace and cap at `max` chars */
const makeExcerpt = (text = "", max = 120) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
};

/** Parse plain text → React nodes with clickable URLs + preserved newlines */
const parseContentWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e63946] font-medium underline underline-offset-2
                     decoration-[#e63946]/40 hover:decoration-[#e63946]
                     transition-all break-all"
        >
          {part}
        </a>
      );
    }
    return part.split("\n").map((line, i, arr) => (
      <span key={`${index}-${i}`}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ));
  });
};

// ── Article SEO head ─────────────────────────────────────────────────
const ArticleSEO = ({ post }) => {
  const pageUrl    = `${SITE_URL}/article/${post.slug}`;
  const ogImage    = post.coverImage || FALLBACK_OG_IMAGE;
  const description = makeExcerpt(post.content);
  const authorName  = post.author?.name || SITE_NAME;
  const publishedAt = post.createdAt
    ? new Date(post.createdAt).toISOString()
    : undefined;

  // JSON-LD NewsArticle schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": description,
    "image": [ogImage],
    "datePublished": publishedAt,
    "dateModified": post.updatedAt
      ? new Date(post.updatedAt).toISOString()
      : publishedAt,
    "author": {
      "@type": "Person",
      "name": authorName,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.jpg`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    "articleSection": post.category,
    "url": pageUrl,
  };

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{`${post.title} — ${SITE_NAME}`}</title>
      <meta name="description"        content={description} />
      <meta name="author"             content={authorName} />
      <meta name="robots"             content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical"           href={pageUrl} />

      {/* ── Open Graph (Facebook / WhatsApp / LinkedIn) ── */}
      <meta property="og:type"        content="article" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_NG" />
      <meta property="og:url"         content={pageUrl} />
      <meta property="og:title"       content={`${post.title} — ${SITE_NAME}`} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt"    content={post.title} />
      <meta property="og:image:type"   content="image/jpeg" />

      {/* Article-specific OG */}
      {publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {post.updatedAt && (
        <meta
          property="article:modified_time"
          content={new Date(post.updatedAt).toISOString()}
        />
      )}
      <meta property="article:author"  content={authorName} />
      <meta property="article:section" content={post.category} />
      <meta property="article:tag"     content={`LASU, ${post.category}, Lagos State University`} />

      {/* ── Twitter / X Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER_HANDLE} />
      <meta name="twitter:creator"     content={TWITTER_HANDLE} />
      <meta name="twitter:url"         content={pageUrl} />
      <meta name="twitter:title"       content={`${post.title} — ${SITE_NAME}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
      <meta name="twitter:image:alt"   content={post.title} />

      {/* ── WhatsApp (uses OG, but this reinforces it) ── */}
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />

      {/* ── JSON-LD Structured Data ── */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

// ── Share Modal ──────────────────────────────────────────────────────
const ShareModal = ({ post, onClose }) => {
  const [copied, setCopied] = useState(false);
  const pageUrl      = `${SITE_URL}/news/${post.slug}`;
  const encodedUrl   = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(post?.title || "");

  const shareLinks = [
    {
      name: "Twitter / X",
      color: "hover:bg-black/5 hover:border-black/20",
      iconColor: "text-black",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.726-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      color: "hover:bg-blue-50 hover:border-blue-200",
      iconColor: "text-[#1877F2]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      color: "hover:bg-green-50 hover:border-green-200",
      iconColor: "text-[#25D366]",
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      color: "hover:bg-blue-50 hover:border-blue-200",
      iconColor: "text-[#0A66C2]",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      color: "hover:bg-sky-50 hover:border-sky-200",
      iconColor: "text-[#26A5E4]",
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = pageUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm
                   animate-[fadeIn_150ms_ease]"
        onClick={onClose}
      />
      <div
        className="relative bg-white w-full sm:max-w-md rounded-t-3xl
                   sm:rounded-2xl shadow-2xl animate-[slideInUp_250ms_ease]
                   overflow-hidden"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-black text-[#0a0a0a]">
                Share Article
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                {post?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl
                         bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Social grid */}
          <div className="grid grid-cols-5 gap-2 mb-5">
            {shareLinks.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl
                            border border-gray-100 transition-all duration-150
                            active:scale-95 ${s.color}`}
              >
                <span className={s.iconColor}>{s.icon}</span>
                <span className="text-[9px] font-semibold text-gray-500
                                 text-center leading-tight">
                  {s.name.split(" ")[0]}
                </span>
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">
              or copy link
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Copy link row */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl
                          p-1 pl-4 border border-gray-100">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656
                   5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4
                   4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="flex-1 text-xs text-gray-500 truncate font-mono">
              {pageUrl}
            </p>
            <button
              onClick={handleCopyLink}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-xs
                         font-bold transition-all duration-200 active:scale-95
                         ${copied
                           ? "bg-green-500 text-white"
                           : "bg-[#e63946] text-white hover:bg-red-700"}`}
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </span>
              ) : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Delete Comment Modal ─────────────────────────────────────────────
const DeleteCommentModal = ({ comment, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm
                 animate-[fadeIn_150ms_ease]"
      onClick={onCancel}
    />
    <div
      className="relative bg-white rounded-2xl shadow-2xl p-6 w-full
                 max-w-md animate-[slideInUp_200ms_ease]"
    >
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center
                      justify-center mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            strokeWidth={1.75}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
               01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0
               00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                     text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Main Article ─────────────────────────────────────────────────────
const Article = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showShare, setShowShare] = useState(false);

  const { data: postData, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const post = postData?.post;

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }) => addComment(postId, content),
    onSuccess: (data) => {
      queryClient.setQueryData(["post", slug], (old) => ({
        ...old,
        post: {
          ...old.post,
          comments: [...(old.post.comments || []), data.comment],
        },
      }));
      setCommentContent("");
    },
    onError: (err) => {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment. Please try again.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: (_, commentId) => {
      queryClient.setQueryData(["post", slug], (old) => ({
        ...old,
        post: {
          ...old.post,
          comments: old.post.comments.filter((c) => c.id !== commentId),
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
    addCommentMutation.mutate({ postId: post.id, content: commentContent.trim() });
  };

  const handleDeleteComment = () => {
    if (pendingDelete) deleteCommentMutation.mutate(pendingDelete.id);
  };

  /* ── Loading skeleton ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <>
        {/* Even while loading, keep a generic title */}
        <Helmet>
          <title>Loading article… — {SITE_NAME}</title>
          <meta name="robots" content="noindex" />
        </Helmet>

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
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-100 rounded animate-pulse"
                  style={{ width: `${100 - i * 5}%` }}
                />
              ))}
            </div>
          </article>
        </div>
      </>
    );
  }

  /* ── Error state ──────────────────────────────────────────────────── */
  if (error || !post) {
    return (
      <>
        <Helmet>
          <title>Article Not Found — {SITE_NAME}</title>
          <meta name="robots" content="noindex" />
        </Helmet>

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
              {error?.message ||
                "This article doesn't exist or has been removed."}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5
                         bg-[#e63946] text-white rounded-xl font-semibold
                         text-sm hover:bg-red-700 transition-colors"
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
      </>
    );
  }

  /* ── Happy path ───────────────────────────────────────────────────── */
  const readingTime = Math.max(
    1,
    Math.ceil(post.content?.split(" ").length / 200)
  );

  return (
    <>
      {/* ══ Dynamic SEO head ══ */}
      <ArticleSEO post={post} />

      {/* ══ Modals ══ */}
      {pendingDelete && (
        <DeleteCommentModal
          comment={pendingDelete}
          onConfirm={handleDeleteComment}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      {showShare && (
        <ShareModal post={post} onClose={() => setShowShare(false)} />
      )}

      <div className="min-h-screen bg-[#f8fafc]">

        {/* ── Sticky header ── */}
        <header className="bg-white/80 backdrop-blur-md border-b
                           border-gray-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4
                          flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold
                         text-gray-500 hover:text-[#e63946] transition-colors
                         group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-0.5
                           transition-transform"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>

            <button
              onClick={() => setShowShare(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2
                         rounded-xl border border-gray-200 text-xs
                         font-semibold text-gray-500 hover:text-[#e63946]
                         hover:border-[#e63946]/30 hover:bg-red-50/50
                         transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482
                     -.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0
                     2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0
                     105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0
                     105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </header>

        {/* ── Article ── */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* Category badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center text-[11px] font-bold
                          uppercase tracking-widest px-3 py-1.5 rounded-full
                          ${categoryColors[post.category] ||
                            categoryColors.UPDATES}`}
            >
              {post.category}
            </span>
            {post.campus && (
              <span
                className={`inline-flex items-center text-[11px] font-bold
                            uppercase tracking-widest px-3 py-1.5 rounded-full
                            ${campusColors[post.campus] || campusColors.OJO}`}
              >
                {post.campus} Campus
              </span>
            )}
          </div>

          {/* Title — h1 for SEO */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black
                       text-[#0a0a0a] leading-tight mt-4 mb-6"
          >
            {post.title}
          </h1>

          {/* Meta row */}
          <div
            className="flex items-center justify-between gap-4 mb-8 pb-8
                        border-b border-gray-100 flex-wrap"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-br
                            from-red-500 to-orange-500 flex items-center
                            justify-center text-white font-bold text-lg
                            flex-shrink-0 ring-2 ring-white shadow-sm"
              >
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

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readingTime} min read
            </div>
          </div>

          {/* Cover image — loading="eager" for LCP */}
          {post.coverImage && (
            <div className="mb-10 rounded-2xl overflow-hidden
                            shadow-xl shadow-gray-200/60">
              <img
                src={post.coverImage}
                alt={post.title}
                loading="eager"
                fetchpriority="high"
                className="w-full h-64 sm:h-80 lg:h-[28rem] object-cover"
              />
            </div>
          )}

          {/* Article content */}
          <div className="mb-12">
            <p className="text-gray-700 leading-[1.85] text-base sm:text-lg
                          font-[400] tracking-[0.01em]">
              {parseContentWithLinks(post.content)}
            </p>
          </div>

          {/* Share CTA strip */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between
                        gap-4 bg-gradient-to-r from-gray-50 to-gray-50/50
                        border border-gray-100 rounded-2xl px-6 py-5 mb-12"
          >
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-[#0a0a0a]">
                Enjoyed this article?
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Share it with your network and spread the word.
              </p>
            </div>
            <button
              onClick={() => setShowShare(true)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5
                         bg-[#e63946] text-white rounded-xl text-sm
                         font-bold hover:bg-red-700 active:scale-95
                         transition-all shadow-sm shadow-red-200 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482
                     -.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0
                     2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0
                     105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0
                     105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Article
            </button>
          </div>

          {/* ── Comments ── */}
          <section aria-label="Comments" className="pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-black text-[#0a0a0a] mb-6
                           flex items-center gap-3">
              Comments
              <span
                className="inline-flex items-center justify-center
                           min-w-[1.75rem] h-7 px-2 bg-gray-100
                           text-gray-500 text-sm font-bold rounded-full"
              >
                {post.comments?.length || 0}
              </span>
            </h2>

            {/* Comment form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="bg-white rounded-2xl border border-gray-100
                                p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-br
                                  from-blue-500 to-purple-500 flex items-center
                                  justify-center text-white font-bold text-sm
                                  flex-shrink-0 ring-2 ring-white shadow-sm"
                    >
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
                                 placeholder:text-gray-300 bg-gray-50/50"
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
                      className="px-5 py-2.5 bg-[#e63946] text-white
                                 rounded-xl font-semibold text-sm
                                 hover:bg-red-700 active:scale-[0.97]
                                 transition-all disabled:opacity-50
                                 disabled:cursor-not-allowed
                                 disabled:active:scale-100
                                 flex items-center gap-2 shadow-sm
                                 shadow-red-200"
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
                          Posting…
                        </>
                      ) : "Post Comment"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div
                className="mb-8 bg-gradient-to-br from-gray-50 to-white
                            border border-gray-100 rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex
                                items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0
                         4.418-4.03 8-9 8a9.863 9.863 0
                         01-4.255-.949L3 20l1.395-3.72C3.512
                         15.042 3 13.574 3 12c0-4.418 4.03-8
                         9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#0a0a0a] mb-1">
                  Join the conversation
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Please{" "}
                  <Link to="/login"
                    className="text-[#e63946] font-semibold hover:underline">
                    log in
                  </Link>{" "}
                  to leave a comment.
                </p>
              </div>
            )}

            {/* Comments list */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-3">
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`bg-white rounded-2xl border border-gray-100
                                p-5 shadow-sm transition-all duration-300
                                ${deleteCommentMutation.isPending &&
                                  pendingDelete?.id === comment.id
                                  ? "opacity-40 scale-[0.99]" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-full bg-gradient-to-br
                                    from-blue-100 to-purple-100 flex
                                    items-center justify-center text-blue-600
                                    font-bold text-sm flex-shrink-0"
                      >
                        {comment.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between
                                        gap-4 mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-[#0a0a0a]">
                              {comment.user?.name || "Unknown"}
                            </p>
                            <span className="text-[11px] text-gray-400">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          {(user?.id === comment.userId ||
                            user?.role === "ADMIN") && (
                            <button
                              onClick={() => setPendingDelete(comment)}
                              className="text-[11px] font-semibold
                                         text-gray-400 hover:text-red-500
                                         transition-colors flex items-center
                                         gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                  strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138
                                     21H7.862a2 2 0 01-1.995-1.858L5
                                     7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1
                                     1 0 00-1 1v3M4 7h16" />
                              </svg>
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
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex
                                items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-300" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0
                         4.418-4.03 8-9 8a9.863 9.863 0
                         01-4.255-.949L3 20l1.395-3.72C3.512
                         15.042 3 13.574 3 12c0-4.418 4.03-8
                         9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-400 mb-1">
                  No comments yet
                </p>
                <p className="text-xs text-gray-300">
                  Be the first to share your thoughts!
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