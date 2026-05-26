import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: "Dashboard", to: "/admin", icon: "📊" },
    { label: "Posts", to: "/admin/posts", icon: "📝" },
    { label: "Comments", to: "/admin/comments", icon: "💬" },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-[#0a0a0a] text-white min-h-screen fixed left-0 top-0 p-6 flex flex-col">
      {/* Logo */}
      <Link to="/admin" className="flex items-center gap-1 mb-10">
        <span className="font-black text-2xl tracking-tighter">LASU</span>
        <span className="text-[#e63946] font-black text-2xl tracking-tighter">.NEWS</span>
        <span className="text-xs text-white/50 ml-2">Admin</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.to)
                ? "bg-[#e63946] text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Back to Site */}
      <div className="pt-6 border-t border-white/10 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="text-lg">🌐</span>
          <span className="font-medium">View Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
