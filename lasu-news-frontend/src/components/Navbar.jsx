import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide navbar on login, signup, and admin pages
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { label: "News", to: "/" },
    { label: "Politics", to: "/?category=Politics" },
    { label: "Sports", to: "/?category=Sports" },
    { label: "Campus", to: "/?category=Campus" },
    { label: "General", to: "/?category=General" },
  ];

  if (hideNavbar) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Main Navbar */}
      <nav
        className={`bg-[#0a0a0a] text-white transition-shadow duration-300 ${
          scrolled ? "shadow-lg" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 shrink-0">
            <span className="text-white font-black text-2xl tracking-tighter">
              LASU
            </span>
            <span className="text-[#e63946] font-black text-2xl tracking-tighter">
              .NEWS
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3 text-sm font-medium shrink-0">
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="bg-[#e63946] hover:bg-[#c1121f] text-white px-4 py-2 rounded-full transition-colors text-xs font-bold tracking-wide"
                  >
                    Admin Panel
                  </Link>
                )}
                <span className="text-white/50 text-xs">
                  Hi, {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="border border-white/20 hover:border-white/60 text-white/70 hover:text-white px-4 py-2 rounded-full transition-all text-xs"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/70 hover:text-white transition-colors px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-[#0a0a0a] border-2 hover:bg-black font-bold px-5 py-2 rounded-full transition-colors text-xs tracking-wide"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-1 bg-[#0a0a0a]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-2 pt-4 flex flex-col gap-2">
              {user ? (
                <>
                  {user.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="bg-[#e63946] text-white text-center py-2.5 rounded-full text-sm font-bold"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <span className="text-white/40 text-xs px-3">
                    Logged in as {user.name.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="border border-white/20 text-white/70 py-2.5 rounded-full text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="border border-white/20 text-white text-center py-2.5 rounded-full text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="border-2 text-[#0a0a0a] text-center py-2.5 rounded-full text-sm font-bold"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Breaking News Ticker */}
      <div className="bg-[#e63946] text-white text-xs py-1.5 overflow-hidden">
        <div className="flex items-center">
          <span className="shrink-0 bg-white text-[#e63946] font-black text-xs px-3 py-0.5 mr-4 uppercase tracking-wider">
            Breaking
          </span>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee whitespace-nowrap">
              Stay ahead with the latest campus updates, breaking news, and
              stories that matter — LASU News, your campus voice.&nbsp;&nbsp;
              ●&nbsp;&nbsp; New academic calendar released for 2024/2025
              session.&nbsp;&nbsp; ●&nbsp;&nbsp; LASU students excel at
              national debate championship.&nbsp;&nbsp; ●&nbsp;&nbsp; Campus
              shuttle service expanded to more routes.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;