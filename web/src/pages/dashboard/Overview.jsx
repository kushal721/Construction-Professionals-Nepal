import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  FileText,
  Heart,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Star,
  UserCog,
  Users,
} from "lucide-react";
import { api, fileUrl } from "../../lib/api";
import { formatDay, formatTime, plural } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import { DesignCard } from "../../components/DesignCard";
import { useFavorites } from "../../hooks/useFavorites";
import {
  Avatar,
  ButtonLink,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StarRating,
  StatusBadge,
} from "../../components/ui";

const color = (token) => `rgb(var(--${token}))`;
const STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const STATUS_COLOR = { pending: "warning", confirmed: "success", completed: "info", cancelled: "danger" };

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

// ---------- Building blocks ----------

function StatTile({ label, value, icon: Icon, hint, to }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </>
  );
  const cls = "card block p-5 transition";
  return to ? (
    <Link to={to} className={`${cls} hover:border-brand/40 hover:shadow-lift`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-sans text-base font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PanelLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
      {children} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: color("surface"),
    border: `1px solid ${color("line")}`,
    borderRadius: 12,
    fontSize: 12,
    color: color("ink"),
  },
  labelStyle: { color: color("ink"), fontWeight: 700 },
  itemStyle: { color: color("ink-soft") },
  cursor: { fill: "rgb(var(--muted) / 0.6)", stroke: color("line") },
};

const axisProps = {
  tick: { fill: color("ink-faint"), fontSize: 12 },
  axisLine: false,
  tickLine: false,
};

function GrowthChart({ series }) {
  // series: [{ key, name, data: [{label,count}], token }]
  const rows = series[0].data.map((d, i) => ({
    label: d.label,
    ...Object.fromEntries(series.map((s) => [s.key, s.data[i]?.count || 0])),
  }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color(s.token)} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color(s.token)} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={color("line")} vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis allowDecimals={false} {...axisProps} />
          <Tooltip {...tooltipStyle} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: color("ink-soft") }} iconType="circle" />}
          {series.map((s) => (
            <Area
              key={s.key}
              type="linear"
              dataKey={s.key}
              name={s.name}
              stroke={color(s.token)}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryChart({ categories }) {
  const rows = Object.entries(categories || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  if (!rows.length) return <p className="py-10 text-center text-sm text-ink-faint">No designs yet</p>;
  return (
    <div style={{ height: Math.max(180, rows.length * 34) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={color("line")} horizontal={false} />
          <XAxis type="number" allowDecimals={false} {...axisProps} />
          <YAxis type="category" dataKey="name" width={96} {...axisProps} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="count" name="Designs" fill={color("brand")} radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusBreakdown({ counts = {} }) {
  const total = STATUSES.reduce((a, s) => a + (counts[s] || 0), 0);
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
        {total > 0 &&
          STATUSES.map((s) =>
            counts[s] ? (
              <div key={s} style={{ width: `${(counts[s] / total) * 100}%`, background: color(STATUS_COLOR[s]) }} />
            ) : null
          )}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-xl bg-muted/60 px-3 py-2.5">
            <dt className="flex items-center gap-2 text-xs font-semibold capitalize text-ink-soft">
              <span className="h-2 w-2 rounded-full" style={{ background: color(STATUS_COLOR[s]) }} aria-hidden />
              {s}
            </dt>
            <dd className="mt-0.5 text-xl font-bold">{counts[s] || 0}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TopDesigns({ designs, showDesigner, showComments }) {
  if (!designs?.length) return <p className="py-6 text-center text-sm text-ink-faint">No designs yet</p>;
  return (
    <ul className="divide-y divide-line">
      {designs.map((d, i) => (
        <li key={d._id}>
          <Link to={`/designs/${d._id}`} className="flex items-center gap-3 py-3 hover:text-brand">
            <span className="w-4 text-xs font-bold text-ink-faint">{i + 1}</span>
            {d.designImages?.[0] ? (
              <img src={fileUrl(d.designImages[0])} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="h-11 w-14 shrink-0 rounded-lg bg-muted" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{d.designName}</span>
              <span className="block truncate text-xs text-ink-faint">
                {showDesigner && d.designer_name}
                {showComments && plural(d.commentCount || 0, "comment")}
              </span>
            </span>
            <StarRating value={d.averageRating} count={d.totalRatings} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

// ---------- Role views ----------

function AdminOverview({ stats }) {
  return (
    <>
      <PageHeader eyebrow="Admin" title="Platform overview" description="Activity across users, designs and bookings." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Users" value={stats.users} icon={Users} to="/dashboard/admin/users" hint={`${stats.roles?.client || 0} clients`} />
        <StatTile label="Professionals" value={stats.roles?.professional || 0} icon={UserCog} to="/dashboard/admin/report" />
        <StatTile label="Designs" value={stats.designs} icon={LayoutGrid} to="/dashboard/admin/designs" />
        <StatTile label="Bookings" value={stats.bookings} icon={CalendarDays} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel title="Growth (last 6 months)" className="lg:col-span-3">
          <GrowthChart
            series={[
              { key: "users", name: "New users", data: stats.userGrowth, token: "brand" },
              { key: "designs", name: "New designs", data: stats.designGrowth, token: "info" },
            ]}
          />
        </Panel>
        <Panel title="Booking status" className="lg:col-span-2">
          <StatusBreakdown counts={stats.bookingStatus} />
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Designs by category" action={<PanelLink to="/dashboard/admin/designs">Manage</PanelLink>}>
          <CategoryChart categories={stats.categories} />
        </Panel>
        <Panel title="Top rated designs">
          <TopDesigns designs={stats.topDesigns} showDesigner />
        </Panel>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ButtonLink to="/dashboard/admin/users" variant="secondary">
          <Users className="h-4 w-4" /> Manage users
        </ButtonLink>
        <ButtonLink to="/dashboard/admin/designs" variant="secondary">
          <LayoutGrid className="h-4 w-4" /> Moderate designs
        </ButtonLink>
        <ButtonLink to="/dashboard/admin/report" variant="secondary">
          <FileText className="h-4 w-4" /> Professional report
        </ButtonLink>
      </div>
    </>
  );
}

function ProfessionalOverview({ stats, user }) {
  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title={`Welcome back, ${user.username.split(" ")[0]}`}
        description="Here's how your designs and bookings are doing."
        actions={
          <>
            <ButtonLink to="/dashboard/availability" variant="secondary">
              <CalendarClock className="h-4 w-4" /> Add availability
            </ButtonLink>
            <ButtonLink to="/dashboard/designs/new">
              <Plus className="h-4 w-4" /> Publish design
            </ButtonLink>
          </>
        }
      />
      {!stats.profileComplete && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand/30 bg-brand-soft p-5 sm:flex-row sm:items-center">
          <UserCog className="h-8 w-8 shrink-0 text-brand" aria-hidden />
          <div className="flex-1">
            <p className="font-bold text-ink">Complete your professional profile</p>
            <p className="text-sm text-ink-soft">
              Add your specialization, experience and skills so clients can find and trust you.
            </p>
          </div>
          <ButtonLink to="/dashboard/settings">Complete profile</ButtonLink>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Published designs" value={stats.designCount} icon={LayoutGrid} to="/dashboard/designs" />
        <StatTile
          label="Average rating"
          value={stats.averageRating ? stats.averageRating.toFixed(1) : "—"}
          icon={Star}
          hint={plural(stats.ratingCount, "rating")}
        />
        <StatTile label="Saved by clients" value={stats.favorites} icon={Heart} hint={plural(stats.commentCount, "comment")} />
        <StatTile label="Upcoming slots" value={stats.upcomingSlots} icon={CalendarClock} to="/dashboard/availability" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel title="Booking requests (6 months)" className="lg:col-span-3">
          <GrowthChart series={[{ key: "bookings", name: "Bookings", data: stats.bookingGrowth, token: "brand" }]} />
        </Panel>
        <Panel title="Bookings by status" className="lg:col-span-2" action={<PanelLink to="/dashboard/bookings">View all</PanelLink>}>
          <StatusBreakdown counts={stats.bookingStatus} />
        </Panel>
      </div>
      <Panel title="Your top designs" className="mt-4" action={<PanelLink to="/dashboard/designs">Manage</PanelLink>}>
        {stats.topDesigns?.length ? (
          <TopDesigns designs={stats.topDesigns} showComments />
        ) : (
          <EmptyState
            icon={LayoutGrid}
            title="No designs yet"
            description="Publish your first design to start getting noticed."
            action={<ButtonLink to="/dashboard/designs/new">Publish design</ButtonLink>}
          />
        )}
      </Panel>
    </>
  );
}

function ClientOverview({ stats, user }) {
  const { isFavorite, toggle } = useFavorites();
  const bookings = useQuery({ queryKey: ["bookings"], queryFn: () => api("/bookings") });
  const favorites = useQuery({ queryKey: ["favorites", "list"], queryFn: () => api("/favorites") });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = (bookings.data || [])
    .filter((b) => b.status !== "cancelled" && b.status !== "completed" && new Date(b.appointment.date) >= today)
    .sort((a, b) => new Date(a.appointment.date) - new Date(b.appointment.date) || a.appointmentTime.localeCompare(b.appointmentTime))
    .slice(0, 3);
  const s = stats.bookingStatus || {};

  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title={`Welcome, ${user.username.split(" ")[0]}`}
        description="Pick up where you left off on your building journey."
        actions={
          <>
            <ButtonLink to="/professionals" variant="secondary">
              <Users className="h-4 w-4" /> Find professionals
            </ButtonLink>
            <ButtonLink to="/designs">
              <Search className="h-4 w-4" /> Browse designs
            </ButtonLink>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Pending requests" value={s.pending || 0} icon={CalendarClock} to="/dashboard/bookings" />
        <StatTile label="Confirmed bookings" value={s.confirmed || 0} icon={CalendarDays} to="/dashboard/bookings" />
        <StatTile label="Completed consultations" value={s.completed || 0} icon={Star} />
        <StatTile label="Saved designs" value={stats.favorites} icon={Heart} to="/dashboard/favorites" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel title="Upcoming consultations" className="lg:col-span-3" action={<PanelLink to="/dashboard/bookings">All bookings</PanelLink>}>
          {bookings.isLoading ? (
            <Skeleton className="h-40" />
          ) : bookings.isError ? (
            <ErrorState error={bookings.error} onRetry={bookings.refetch} />
          ) : upcoming.length ? (
            <ul className="space-y-3">
              {upcoming.map((b) => (
                <li key={b._id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <div className="grid w-14 shrink-0 place-items-center rounded-lg bg-brand-soft py-1.5 text-brand">
                    <span className="text-[11px] font-bold uppercase">{formatDay(b.appointment.date).split(",")[0]}</span>
                    <span className="text-lg font-bold leading-none">{new Date(b.appointment.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Avatar user={b.professional} size="xs" />
                      <p className="truncate text-sm font-semibold">{b.professional?.username}</p>
                    </div>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-ink-faint">
                      {formatTime(b.appointmentTime)} · <MapPin className="h-3 w-3" aria-hidden /> {b.appointment.location}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming consultations"
              description="Book a time with an architect, engineer or contractor."
              action={<ButtonLink to="/professionals" size="sm">Find a professional</ButtonLink>}
            />
          )}
        </Panel>
        <Panel title="Quick actions" className="lg:col-span-2">
          <div className="grid gap-2">
            {[
              { to: "/designs", icon: Search, label: "Browse house designs", desc: "Filter by budget, size and style" },
              { to: "/professionals", icon: Users, label: "Find a professional", desc: "Architects, engineers, contractors" },
              { to: "/dashboard/messages", icon: MessageSquare, label: "Messages", desc: "Chat with professionals" },
            ].map(({ to, icon: Icon, label, desc }) => (
              <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-brand/40 hover:bg-muted/50">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-ink-soft">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-ink-faint">{desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-ink-faint" aria-hidden />
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recently saved</h2>
          <PanelLink to="/dashboard/favorites">See all</PanelLink>
        </div>
        {favorites.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : favorites.data?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.data.slice(0, 3).map((d) => (
              <DesignCard key={d._id} design={d} isFavorite={isFavorite(d._id)} onToggleFavorite={toggle} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any design to keep it here."
            action={<ButtonLink to="/designs" size="sm">Browse designs</ButtonLink>}
          />
        )}
      </section>
    </>
  );
}

export default function Overview() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => api("/stats/dashboard"),
  });

  if (isLoading) return <OverviewSkeleton />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (user.role === "admin") return <AdminOverview stats={data} />;
  if (user.role === "professional") return <ProfessionalOverview stats={data} user={user} />;
  return <ClientOverview stats={data} user={user} />;
}
