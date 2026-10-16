import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../ui";

// Requires a signed-in user, optionally restricted to roles.
export function RequireAuth({ roles, children }) {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <Spinner className="min-h-[50vh]" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children ?? <Outlet />;
}

// Where to send a user after signing in: the page they were bounced from
// (keeping its query and hash, e.g. "#book"), else the dashboard.
export const returnPath = (state) => {
  const from = state?.from;
  return from ? `${from.pathname}${from.search || ""}${from.hash || ""}` : "/dashboard";
};

// Login/register pages: bounce signed-in users to where they were going.
export function GuestOnly({ children }) {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <Spinner className="min-h-[50vh]" />;
  if (user) return <Navigate to={returnPath(location.state)} replace />;
  return children ?? <Outlet />;
}
