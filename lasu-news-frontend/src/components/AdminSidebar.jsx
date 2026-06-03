import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    label: "Dashboard",
    to: "/admin",
    exact: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0
             01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1
             1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1
             1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    label: "Posts",
    to: "/admin/posts",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1
             1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0
             01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Breaking News",
    to: "/admin/breaking-news",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: "Comments",
    to: "/admin/comments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9
             8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512
             15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <Link
          to="/admin"
          className="flex items-center gap-1 group"
          onClick={() => setMobileOpen(false)}
        >
          <span className="font-black text-2xl tracking-tighter text-white
                           group-hover:text-white/90 transition-colors">
            LASU
          </span>
          <span className="font-black text-2xl tracking-tighter text-[#e63946]">
            .NEWS
          </span>
          <span className="ml-2 text-[10px] font-semibold uppercase
                           tracking-widest text-white/30 bg-white/5 px-2
                           py-0.5 rounded-full">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase
                      tracking-widest text-white/25 select-none">
          Navigation
        </p>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-150 group
                ${
                  active
                    ? "bg-[#e63946] text-white shadow-lg shadow-red-900/30"
                    : "text-white/55 hover:text-white hover:bg-white/[0.07]"
                }
              `}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2
                                 w-0.5 h-5 bg-white rounded-r-full" />
              )}
              
              <span className={`transition-transform duration-150 text-white
                               ${active ? "" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              
              <span className="text-white" >{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-0.5">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                     text-sm font-medium text-white/55 hover:text-white
                     hover:bg-white/[0.07] transition-all duration-150 group"
        >
          <svg className="w-5 h-5 text-white/55 hover:text-white group-hover:rotate-12
                          transition-transform duration-150"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={1.75}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0
                 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="text-white/55 hover:text-white" >View Site</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                     text-sm font-medium text-white/55 hover:text-red-400
                     hover:bg-red-500/10 transition-all duration-150 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-0.5
                          transition-transform duration-150"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={1.75}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3
                 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14
                         bg-[#0a0a0a] border-b border-white/[0.06]
                         flex items-center justify-between px-4">
        <Link to="/admin" className="flex items-center gap-1">
          <span className="font-black text-xl tracking-tighter text-white">
            LASU
          </span>
          <span className="font-black text-xl tracking-tighter text-[#e63946]">
            .NEWS
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg
                     text-white/70 hover:text-white hover:bg-white/10
                     transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a0a0a]
                        min-h-screen fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm
                       animate-[fadeIn_150ms_ease]"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-[#0a0a0a]
                            h-full flex flex-col shadow-2xl
                            animate-[slideInLeft_220ms_ease]">
            {/* Close btn */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center
                         justify-center rounded-lg text-white/50
                         hover:text-white hover:bg-white/10 transition-colors
                         z-10"
              aria-label="Close menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;