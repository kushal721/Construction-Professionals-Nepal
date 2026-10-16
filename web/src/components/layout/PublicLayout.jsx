import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ButtonLink, IconButton } from "../ui";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const NAV = [
  { to: "/designs", label: "Designs" },
  { to: "/professionals", label: "Professionals" },
  { to: "/about", label: "How it works" },
  { to: "/contact", label: "Contact" },
];

function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { pathname } = location;
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const linkClass = ({ isActive }) =>
    clsx(
      "rounded-lg px-3 py-2 text-sm font-semibold transition",
      isActive ? "text-brand" : "text-ink-soft hover:text-ink"
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <ButtonLink to="/login" state={{ from: location }} variant="ghost">
                Sign in
              </ButtonLink>
              <ButtonLink to="/register">Get started</ButtonLink>
            </div>
          )}
          <IconButton label={open ? "Close menu" : "Open menu"} className="md:hidden" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </IconButton>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-surface md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
            {!user && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <ButtonLink to="/login" state={{ from: location }} variant="secondary">
                  Sign in
                </ButtonLink>
                <ButtonLink to="/register">Get started</ButtonLink>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function SiteFooter() {
  const cols = [
    { title: "Explore", links: [["/designs", "House designs"], ["/professionals", "Find professionals"], ["/about", "How it works"]] },
    { title: "For professionals", links: [["/register?role=professional", "Join as a professional"], ["/dashboard/designs/new", "Publish a design"], ["/dashboard/availability", "Manage availability"]] },
    { title: "Company", links: [["/contact", "Contact us"], ["/about", "About"]] },
  ];
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-soft">
            Connecting families across Nepal with trusted architects, engineers, interior designers and contractors.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="font-sans text-sm font-bold">{c.title}</h3>
            <ul className="mt-3 space-y-2">
              {c.links.map(([to, label]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-ink-soft hover:text-brand">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-faint sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Construction Professionals Nepal</p>
          <p>Made in Kathmandu</p>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
