import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  ArrowLeft,
  Briefcase,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  GraduationCap,
  LayoutGrid,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { formatDate, formatDay, formatTime, plural } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import { DesignCard } from "../../components/DesignCard";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  ErrorState,
  Field,
  Skeleton,
  StarRating,
  Textarea,
} from "../../components/ui";

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

// 30-minute start times from the window start up to 30 minutes before it ends.
const timeOptions = (slot) => {
  const out = [];
  for (let t = toMinutes(slot.startTime); t <= toMinutes(slot.endTime) - 30; t += 30) out.push(toHHMM(t));
  return out;
};

function BookingPanel({ pro, user, location }) {
  const queryClient = useQueryClient();
  const [slotId, setSlotId] = useState(null);
  const [time, setTime] = useState(null);
  const [remark, setRemark] = useState("");
  const [booked, setBooked] = useState(null);
  const canBook = user?.role === "client";

  const slots = useQuery({
    queryKey: ["slots", pro._id],
    queryFn: () => api(`/professionals/${pro._id}/slots`),
  });

  const byDay = useMemo(() => {
    const groups = new Map();
    (slots.data || []).forEach((s) => {
      const key = formatDay(s.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    });
    return [...groups.entries()];
  }, [slots.data]);

  const slot = slots.data?.find((s) => s._id === slotId);

  const book = useMutation({
    mutationFn: () => api("/bookings", { method: "POST", body: { slotId, time, remark: remark.trim() || undefined } }),
    onSuccess: (res) => {
      toast.success(res.message);
      setBooked({ day: slot.date, time });
      setSlotId(null);
      setTime(null);
      setRemark("");
      queryClient.invalidateQueries({ queryKey: ["slots", pro._id] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => {
      toast.error(err.message);
      queryClient.invalidateQueries({ queryKey: ["slots", pro._id] });
    },
  });

  return (
    <section id="book" className="card scroll-mt-24 p-5 sm:p-6" aria-labelledby="book-heading">
      <h2 id="book-heading" className="flex items-center gap-2 font-sans text-lg font-bold">
        <CalendarCheck className="h-5 w-5 text-brand" aria-hidden /> Book a consultation
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Pick a day and a 30-minute start time. {pro.username.split(" ")[0]} will confirm your request.</p>

      {booked && (
        <div className="mt-4 rounded-xl border border-success/30 bg-success-soft p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Request sent for {formatDay(booked.day)} at {formatTime(booked.time)}
          </p>
          <Link to="/dashboard/bookings" className="link mt-1 inline-block">
            View my bookings
          </Link>
        </div>
      )}

      {slots.isLoading ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : slots.isError ? (
        <ErrorState className="mt-5" error={slots.error} onRetry={slots.refetch} />
      ) : byDay.length === 0 ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-line p-4 text-sm text-ink-soft">
          <CalendarX className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden />
          No upcoming availability. Send a message to arrange a time.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold">Choose a day</p>
            <div className="space-y-2">
              {byDay.map(([day, daySlots]) =>
                daySlots.map((s) => {
                  const free = timeOptions(s).filter((t) => !s.bookedTimes.includes(t)).length;
                  return (
                    <button
                      key={s._id}
                      type="button"
                      disabled={!free}
                      onClick={() => {
                        setSlotId(s._id);
                        setTime(null);
                      }}
                      aria-pressed={slotId === s._id}
                      className={clsx(
                        "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                        slotId === s._id ? "border-brand bg-brand-soft" : "border-line hover:border-brand/50"
                      )}
                    >
                      <span>
                        <span className="block text-sm font-bold">{day}</span>
                        <span className="block text-xs text-ink-soft">
                          {formatTime(s.startTime)} – {formatTime(s.endTime)} · {s.location}
                        </span>
                      </span>
                      <Badge tone={free ? "success" : "neutral"}>{free ? `${free} open` : "Full"}</Badge>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {slot && (
            <form
              className="space-y-4 border-t border-line pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                book.mutate();
              }}
            >
              <div>
                <p className="mb-2 text-sm font-semibold" id="time-label">
                  Start time
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-labelledby="time-label">
                  {timeOptions(slot).map((t) => {
                    const taken = slot.bookedTimes.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={time === t}
                        disabled={taken}
                        onClick={() => setTime(t)}
                        className={clsx(
                          "rounded-lg border px-2 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-40",
                          time === t ? "border-brand bg-brand text-brand-ink" : "border-line hover:border-brand/50"
                        )}
                      >
                        {formatTime(t)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {canBook ? (
                <>
                  <Field label="What would you like to discuss?" optional>
                    <Textarea
                      rows={3}
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder="Plot size, budget, the design you liked…"
                      maxLength={1000}
                    />
                  </Field>
                  <Button type="submit" className="w-full" disabled={!time} loading={book.isPending}>
                    {time ? `Request ${formatTime(time)} on ${formatDay(slot.date)}` : "Select a time"}
                  </Button>
                </>
              ) : user ? (
                <p className="rounded-xl bg-muted p-3 text-sm text-ink-soft">
                  Only client accounts can book consultations. You're signed in as a {user.role}.
                </p>
              ) : (
                <ButtonLink to="/login" state={{ from: { ...location, hash: "#book" } }} className="w-full">
                  Sign in to book
                </ButtonLink>
              )}
            </form>
          )}
        </div>
      )}
    </section>
  );
}

function PageSkeleton() {
  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-5">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export default function ProfessionalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();

  const { data: pro, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["professional", id],
    queryFn: () => api(`/professionals/${id}`),
  });

  const message = useMutation({
    mutationFn: () => api("/chats", { method: "POST", body: { userId: id } }),
    onSuccess: (chat) => navigate(`/dashboard/messages/${chat._id}`),
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (pro && location.hash === "#book") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [pro, location.hash]);

  if (isLoading) return <PageSkeleton />;
  if (isError) {
    return (
      <div className="container-page py-16">
        {error.status === 404 ? (
          <EmptyState
            icon={UserRound}
            title="Professional not found"
            description="This profile may have been removed."
            action={<ButtonLink to="/professionals">Browse professionals</ButtonLink>}
          />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </div>
    );
  }

  const d = pro.details || {};
  const skills = (d.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isSelf = user?._id === pro._id;

  const onMessage = () => {
    if (!user) return navigate("/login", { state: { from: location } });
    message.mutate();
  };

  return (
    <div className="pb-4">
      <section className="border-b border-line bg-surface">
        <div className="container-page py-8 sm:py-12">
          <Link to="/professionals" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden /> All professionals
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar user={pro} size="xl" />
              <div className="min-w-0">
                {d.specialization && <Badge tone="brand">{d.specialization}</Badge>}
                <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{pro.username}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                  <StarRating value={pro.averageRating} count={pro.ratingCount} />
                  {pro.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" aria-hidden /> {pro.location}
                    </span>
                  )}
                  {d.experience && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-4 w-4" aria-hidden /> {d.experience} experience
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isSelf ? (
                <ButtonLink to="/dashboard/settings" variant="secondary">
                  <Pencil className="h-4 w-4" aria-hidden /> Edit profile
                </ButtonLink>
              ) : (
                <>
                  <Button variant="secondary" onClick={onMessage} loading={message.isPending}>
                    <MessageSquare className="h-4 w-4" aria-hidden /> Message
                  </Button>
                  <Button onClick={() => document.getElementById("book")?.scrollIntoView({ behavior: "smooth" })}>
                    <CalendarCheck className="h-4 w-4" aria-hidden /> Book consultation
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-2xl font-semibold">
              About
            </h2>
            {d.description ? (
              <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">{d.description}</p>
            ) : (
              <p className="mt-4 text-sm text-ink-faint">{pro.username} hasn't written a bio yet.</p>
            )}
            {skills.length > 0 && (
              <div className="mt-6">
                <h3 className="font-sans text-sm font-bold">Skills</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <li key={s} className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink-soft">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section aria-labelledby="portfolio-heading">
            <h2 id="portfolio-heading" className="text-2xl font-semibold">
              Portfolio <span className="font-sans text-base font-medium text-ink-faint">({plural(pro.designs.length, "design")})</span>
            </h2>
            {pro.designs.length === 0 ? (
              <EmptyState className="mt-5" icon={LayoutGrid} title="No designs published yet" />
            ) : (
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {pro.designs.map((dz) => (
                  <DesignCard key={dz._id} design={dz} isFavorite={isFavorite(dz._id)} onToggleFavorite={toggle} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {!isSelf && <BookingPanel pro={pro} user={user} location={location} />}

          <div className="card space-y-3 p-5 text-sm">
            <h2 className="font-sans text-base font-bold">Details</h2>
            {d.education && (
              <p className="flex gap-2.5 text-ink-soft">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden /> {d.education}
              </p>
            )}
            {user && pro.email && (
              <p className="flex gap-2.5 text-ink-soft">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                <a href={`mailto:${pro.email}`} className="hover:text-brand">
                  {pro.email}
                </a>
              </p>
            )}
            {user && pro.contactNumber && (
              <p className="flex gap-2.5 text-ink-soft">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                <a href={`tel:${pro.contactNumber}`} className="hover:text-brand">
                  {pro.contactNumber}
                </a>
              </p>
            )}
            {!user && <p className="text-xs text-ink-faint">Sign in to see contact details.</p>}
            {pro.createdAt && (
              <p className="flex gap-2.5 text-ink-soft">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden /> Member since{" "}
                {formatDate(pro.createdAt, "MMMM yyyy")}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
