import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";
import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  FileText,
  Heart,
  Home,
  LayoutGrid,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRealtime } from "../../context/RealtimeContext";
import { IconButton } from "../ui";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const NAV = {
  client: [
    { to: "/dashboard", label: "Overview", icon: Home, end: true },
    { to: "/dashboard/bookings", label: "My bookings", icon: CalendarDays },
    { to: "/dashboard/favorites", label: "Saved designs", icon: Heart },
    { to: "/dashboard/messages", label: "Messages", icon: MessageSquare, badge: "unread" },
    { to: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  professional: [
    { to: "/dashboard", label: "Overview", icon: Home, end: true },
    { to: "/dashboard/designs", label: "My designs", icon: LayoutGrid },
    { to: "/dashboard/availability", label: "Availability", icon: CalendarClock },
    { to: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
    { to: "/dashboard/messages", label: "Messages", icon: MessageSquare, badge: "unread" },
    { to: "/dashboard/settings", label: "Profile & settings", icon: Settings },
  ],
  admin: [
    { to: "/dashboard", label: "Overview", icon: BarChart3, end: true },
    { to: "/dashboard/admin/users", label: "Users", icon: Users },
    { to: "/dashboard/admin/designs", label: "Designs", icon: LayoutGrid },
    { to: "/dashboard/admin/report", label: "Professional report", icon: FileText },
    { to: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
};

function SideNav({ onNavigate }) {
  const { user } = useAuth();
  const { unread } = useRealtime();
  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {NAV[user.role].map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              isActive ? "bg-brand-soft text-brand" : "text-ink-soft hover:bg-muted hover:text-ink"
            )
          }
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
          <span className="flex-1">{label}</span>
          {badge === "unread" && unread > 0 && (
            <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-brand-ink">{unread}</span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
        <Logo className="px-2" />
        <div className="mt-8 flex-1 overflow-y-auto">
          <SideNav />
        </div>
        <NavLink to="/" className="mt-4 rounded-xl px-3 py-2 text-xs font-semibold text-ink-faint hover:text-ink">
          ← Back to marketplace
        </NavLink>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-72 animate-fade-up flex-col bg-surface px-4 py-5 shadow-lift">
            <div className="flex items-center justify-between">
              <Logo className="px-2" />
              <IconButton label="Close menu" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="mt-8">
              <SideNav onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <IconButton label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </IconButton>
            <NavLink to="/designs" className="hidden text-sm font-semibold text-ink-soft hover:text-ink sm:block">
              Browse designs
            </NavLink>
            <NavLink to="/professionals" className="hidden px-3 text-sm font-semibold text-ink-soft hover:text-ink sm:block">
              Professionals
            </NavLink>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
