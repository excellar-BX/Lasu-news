import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPosts } from "../api/posts";
import BreakingNews from "./BreakingNews";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // ── Search state ──
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/admin");

  // ── Scroll detection ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Body scroll lock for mobile menu ──
  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  // ── Close menus on route change ──
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // ── Load recent searches from localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to load recent searches:", err);
    }
  }, []);

  // ── Debounced search ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await getPosts({ limit: 100 });
        const query = searchQuery.toLowerCase();
        const filtered = (data.posts || [])
          .filter(
            (p) =>
              p.title?.toLowerCase().includes(query) ||
              p.excerpt?.toLowerCase().includes(query) ||
              p.content?.toLowerCase().includes(query)
          )
          .slice(0, 5);
        setSearchResults(filtered);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // ── Keyboard navigation ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!searchOpen || searchResults.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const selected = searchResults[selectedIndex];
        handleSelectResult(selected);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, searchResults, selectedIndex]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const saveRecentSearch = (query) => {
    try {
      const updated = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save recent search:", err);
    }
  };

  const handleSelectResult = (post) => {
    saveRecentSearch(searchQuery);
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/news/${post.slug}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    saveRecentSearch(searchQuery);
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // ── Responsive nav links — show fewer on medium screens ──
  const navLinks = [
    { label: "News", to: "/", priority: "high" },
    { label: "Updates", to: "/?category=UPDATES", priority: "medium" },
    { label: "Trending", to: "/?category=TRENDING", priority: "high" },
    { label: "Opportunities", to: "/?category=OPPORTUNITIES", priority: "low" },
    { label: "Spotlight", to: "/?category=SPOTLIGHT", priority: "low" },
    { label: "Events", to: "/?category=EVENTS", priority: "medium" },
  ];

  const formatTimeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (hideNavbar) return null;

  return (
    <header className="sticky top-0 z-50">
      {/* ── Main Navbar ── */}
      <nav
        className={`bg-[#0a0a0a] text-white transition-shadow duration-300
                    ${scrolled ? "shadow-lg shadow-black/20" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center
                        justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1 shrink-0 group"
            onClick={() => setMenuOpen(false)}
          >
            <span className="text-white font-black text-xl sm:text-2xl
                             tracking-tighter group-hover:text-white/90
                             transition-colors">
              LASU
            </span>
            <span className="text-[#e63946] font-black text-xl sm:text-2xl
                             tracking-tighter">
              .NEWS
            </span>
          </Link>

          {/* Desktop Nav Links — Responsive: show based on priority */}
          <div className="hidden lg:flex items-center gap-1 text-sm
                          font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`px-3 xl:px-4 py-2 rounded-full hover:bg-white/10
                           transition-colors text-white/70 hover:text-white
                           whitespace-nowrap
                           ${
                             link.priority === "low"
                               ? "hidden xl:block"
                               : link.priority === "medium"
                               ? "hidden lg:block"
                               : ""
                           }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Search + Auth */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 text-sm
                          font-medium shrink-0">
            {/* Search button */}
            <button
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full
                         bg-white/5 hover:bg-white/10 text-white/70
                         hover:text-white transition-all border
                         border-white/10 hover:border-white/20"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <span className="text-xs hidden xl:inline">Search</span>
              <kbd className="hidden 2xl:inline-flex items-center px-1.5
                             py-0.5 text-[10px] font-mono bg-white/10
                             rounded border border-white/20">
                ⌘K
              </kbd>
            </button>

            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="bg-[#e63946] hover:bg-red-700 text-white
                               px-3 xl:px-4 py-2 rounded-full transition-colors
                               text-xs font-bold tracking-wide
                               shadow-sm shadow-red-900/30 whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-white/70 hover:text-white px-3 xl:px-4 py-2
                             rounded-full transition-all text-xs whitespace-nowrap"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="border border-white/20 hover:border-white/60
                             text-white/70 hover:text-white px-3 xl:px-4 py-2
                             rounded-full transition-all text-xs whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/70 border
                         border-white/10 hover:text-white transition-colors
                             px-3 py-2 text-xs whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#e63946] hover:bg-red-700 text-white
                               px-3 xl:px-4 py-2 rounded-full transition-colors
                               text-xs font-bold tracking-wide
                               shadow-sm shadow-red-900/30 whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors
                         text-white/70 hover:text-white"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile Menu Overlay ── */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm
                         animate-[fadeIn_150ms_ease]"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative bg-[#0a0a0a] border-b border-white/10
                            animate-[slideInUp_220ms_ease] max-h-[85vh]
                            overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3
                              border-b border-white/10">
                <Link
                  to="/"
                  className="flex items-center gap-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-white font-black text-xl
                                   tracking-tighter">
                    LASU
                  </span>
                  <span className="text-[#e63946] font-black text-xl
                                   tracking-tighter">
                    .NEWS
                  </span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center
                             rounded-lg text-white/50 hover:text-white
                             hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-4 py-4 space-y-1">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase
                              tracking-widest text-white/25">
                  Navigation
                </p>
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2.5 px-3 rounded-lg hover:bg-white/10
                               text-white/70 hover:text-white text-sm
                               transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/10 px-4 py-4 space-y-2">
                {user ? (
                  <>
                    <p className="px-3 text-xs text-white/30 mb-2">
                      Logged in as {user.name}
                    </p>
                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block bg-[#e63946] text-white text-center
                                   py-2.5 rounded-xl text-sm font-bold
                                   hover:bg-red-700 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block border border-white/20 text-white/70
                                 text-center py-2.5 rounded-xl text-sm
                                 font-medium hover:bg-white/10 hover:text-white
                                 transition-all"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full border border-white/20 text-white/70
                                 py-2.5 rounded-xl text-sm font-medium
                                 hover:bg-white/10 hover:text-white
                                 transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block border border-white/20 text-white
                                 text-center py-2.5 rounded-xl text-sm
                                 font-medium hover:bg-white/10 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="block bg-[#e63946] text-white text-center
                                   py-2.5 rounded-xl text-sm font-bold
                                   hover:bg-red-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center
                        p-4 pt-20 sm:pt-24">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm
                       animate-[fadeIn_150ms_ease]"
            onClick={() => setSearchOpen(false)}
          />

          {/* Search panel */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl
                          shadow-2xl animate-[slideInUp_220ms_ease]
                          overflow-hidden">
            {/* Search input */}
            <form onSubmit={handleSearchSubmit} className="p-4 border-b
                                                            border-gray-100">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5
                             text-gray-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-12 py-3.5 text-base
                             placeholder:text-gray-300 outline-none
                             text-[#0a0a0a] font-medium"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2
                               w-6 h-6 flex items-center justify-center
                               rounded-full hover:bg-gray-100 text-gray-400
                               hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {/* Results / Recent / Loading */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Loading state */}
              {searchLoading && (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-gray-200
                                  border-t-[#e63946] rounded-full animate-spin
                                  mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Searching...</p>
                </div>
              )}

              {/* Results */}
              {!searchLoading && searchQuery && searchResults.length > 0 && (
                <div className="py-2">
                  <p className="px-4 py-2 text-[10px] font-bold uppercase
                                tracking-widest text-gray-400">
                    Results
                  </p>
                  {searchResults.map((post, index) => (
                    <button
                      key={post.id}
                      onClick={() => handleSelectResult(post)}
                      className={`w-full text-left px-4 py-3 flex items-start
                                  gap-3 transition-colors
                                  ${selectedIndex === index
                                    ? "bg-red-50"
                                    : "hover:bg-gray-50"
                                  }`}
                    >
                      {post.coverImage && (
                        <img
                          src={post.coverImage}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover
                                     flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#0a0a0a]
                                      line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {post.category} · {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full px-4 py-3 text-left text-sm
                               text-[#e63946] font-semibold hover:bg-red-50
                               transition-colors border-t border-gray-100"
                  >
                    View all results for "{searchQuery}" →
                  </button>
                </div>
              )}

              {/* No results */}
              {!searchLoading && searchQuery && searchResults.length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full
                                  flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">
                    No results for "{searchQuery}"
                  </p>
                </div>
              )}

              {/* Recent searches (when no query) */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="py-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest
                                  text-gray-400">
                      Recent
                    </p>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-gray-600
                                 font-medium transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(query)}
                      className="w-full text-left px-4 py-2.5 flex items-center
                                 gap-3 hover:bg-gray-50 transition-colors
                                 text-sm text-gray-700"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {query}
                    </button>
                  ))}
                </div>
              )}

              {/* Empty state (no query, no recent) */}
              {!searchQuery && recentSearches.length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full
                                  flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">
                    Start typing to search articles
                  </p>
                </div>
              )}
            </div>

            {/* Footer hints — ONLY SHOW ON DESKTOP */}
            <div className="hidden sm:flex px-4 py-2.5 border-t border-gray-100
                            bg-gray-50 items-center justify-between text-xs
                            text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200
                                 rounded font-mono text-[10px]">
                    ↑↓
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200
                                 rounded font-mono text-[10px]">
                    Enter
                  </kbd>
                  Select
                </span>
              </div>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200
                               rounded font-mono text-[10px]">
                  Esc
                </kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Breaking News Ticker ── */}
      <BreakingNews />
    </header>
  );
};

export default Navbar;