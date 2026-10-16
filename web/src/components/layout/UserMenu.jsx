import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../ui";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const signOut = () => {
    logout();
    toast.success("Signed out");
    navigate("/");
  };

  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-muted hover:text-ink";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 transition hover:bg-muted"
      >
        <Avatar user={user} size="xs" />
        <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:block">{user.username}</span>
        <ChevronDown className="h-4 w-4 text-ink-faint" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-60 animate-fade-up rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-bold">{user.username}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-brand">{user.role}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link role="menuitem" to="/dashboard" className={item} onClick={() => setOpen(false)}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link role="menuitem" to="/dashboard/settings" className={item} onClick={() => setOpen(false)}>
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <button role="menuitem" onClick={signOut} className={`${item} text-danger hover:bg-danger-soft hover:text-danger`}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
