import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/symptoms", label: "Log Symptoms", icon: "📋" },
  { to: "/analysis", label: "AI Analysis", icon: "🤖" },
  { to: "/whatif", label: "What-If", icon: "🔮" },
  { to: "/medicines", label: "Medicines", icon: "💊" },
  { to: "/history", label: "My History", icon: "📁" },
  { to: "/report", label: "Doctor Report", icon: "📄" },
];

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="w-full px-6 lg:px-12 py-3">
        <div className="flex items-center justify-between gap-4">
          <NavLink to="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white bg-linear-to-br from-sky-500 to-cyan-400 shadow-sm">
              🩺
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-slate-800 leading-tight">NoRog</div>
              <div className="text-[10px] text-slate-500 leading-tight">Disease Monitor</div>
            </div>
          </NavLink>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-45 truncate">{user?.name || "User"}</span>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <nav className="mt-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max whitespace-nowrap pr-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sky-100 text-sky-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
