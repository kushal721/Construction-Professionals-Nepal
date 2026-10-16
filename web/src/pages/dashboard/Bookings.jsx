import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { CalendarDays, Check, Clock, Mail, MapPin, MessageSquare, Phone, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { formatDay, formatTime, timeAgo } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import {
  Avatar,
  Button,
  ButtonLink,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StatusBadge,
  useConfirm,
} from "../../components/ui";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function BookingCard({ booking, isPro, onStatus, onRemove, onMessage, busy }) {
  const other = isPro ? booking.client : booking.professional;
  const { appointment: slot, status } = booking;
  const showContact = status === "confirmed" || status === "completed";

  return (
    <article className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-4">
        <Avatar user={other} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-sans text-base font-bold">{other?.username || "Deleted user"}</h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-ink-faint">
            {isPro ? "Client" : "Professional"} · requested {timeAgo(booking.createdAt)}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-ink-faint" aria-hidden />
              {formatDay(slot.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-ink-faint" aria-hidden />
              {formatTime(booking.appointmentTime)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-ink-faint" aria-hidden />
              {slot.location}
            </span>
          </div>
          {booking.remark && (
            <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm text-ink-soft">“{booking.remark}”</p>
          )}
          {showContact && other && (other.email || other.contactNumber) && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
              {other.contactNumber && (
                <a href={`tel:${other.contactNumber}`} className="link inline-flex items-center gap-1.5 font-medium">
                  <Phone className="h-4 w-4" aria-hidden /> {other.contactNumber}
                </a>
              )}
              {other.email && (
                <a href={`mailto:${other.email}`} className="link inline-flex items-center gap-1.5 font-medium">
                  <Mail className="h-4 w-4" aria-hidden /> {other.email}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        {isPro && status === "pending" && (
          <>
            <Button size="sm" onClick={() => onStatus(booking, "confirmed")} loading={busy === "confirmed"}>
              <Check className="h-3.5 w-3.5" /> Confirm
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onStatus(booking, "cancelled")} loading={busy === "cancelled"}>
              <X className="h-3.5 w-3.5" /> Decline
            </Button>
          </>
        )}
        {isPro && status === "confirmed" && (
          <>
            <Button size="sm" onClick={() => onStatus(booking, "completed")} loading={busy === "completed"}>
              <Check className="h-3.5 w-3.5" /> Mark completed
            </Button>
            <Button size="sm" variant="danger-ghost" onClick={() => onStatus(booking, "cancelled")} loading={busy === "cancelled"}>
              Cancel
            </Button>
          </>
        )}
        {!isPro && (status === "pending" || status === "confirmed") && (
          <Button size="sm" variant="danger-ghost" onClick={() => onStatus(booking, "cancelled")} loading={busy === "cancelled"}>
            <X className="h-3.5 w-3.5" /> Cancel booking
          </Button>
        )}
        {other && (
          <Button size="sm" variant="ghost" onClick={() => onMessage(other)} loading={busy === "message"}>
            <MessageSquare className="h-3.5 w-3.5" /> Message
          </Button>
        )}
        {(status === "cancelled" || status === "completed") && (
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => onRemove(booking)} loading={busy === "remove"}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </Button>
        )}
      </div>
    </article>
  );
}

export default function Bookings() {
  const { user } = useAuth();
  const isPro = user.role === "professional";
  const navigate = useNavigate();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [busy, setBusy] = useState({});

  const { data: bookings, isLoading, error, refetch } = useQuery({ queryKey: ["bookings"], queryFn: () => api("/bookings") });

  const track = (id, action) => setBusy((b) => ({ ...b, [id]: action }));
  const untrack = (id) => setBusy(({ [id]: _drop, ...rest }) => rest);
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["stats", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["slots"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api(`/bookings/${id}/status`, { method: "PATCH", body: { status } }),
    onMutate: ({ id, status }) => track(id, status),
    onSuccess: (res) => toast.success(res?.message || "Booking updated"),
    onError: (err) => toast.error(err.message),
    onSettled: (_d, _e, { id }) => {
      untrack(id);
      refresh();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => api(`/bookings/${id}`, { method: "DELETE" }),
    onMutate: (id) => track(id, "remove"),
    onSuccess: () => toast.success("Booking removed"),
    onError: (err) => toast.error(err.message),
    onSettled: (_d, _e, id) => {
      untrack(id);
      refresh();
    },
  });

  const onStatus = async (booking, status) => {
    if (status === "cancelled") {
      const ok = await confirm({
        title: isPro && booking.status === "pending" ? "Decline this request?" : "Cancel this booking?",
        description: "The other person will see this booking as cancelled. This can't be undone.",
        confirmLabel: isPro && booking.status === "pending" ? "Decline" : "Cancel booking",
        tone: "danger",
      });
      if (!ok) return;
    }
    statusMutation.mutate({ id: booking._id, status });
  };

  const onRemove = async (booking) => {
    const ok = await confirm({
      title: "Remove from your list?",
      description: "This booking record will be deleted for both of you.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (ok) removeMutation.mutate(booking._id);
  };

  const onMessage = async (booking, other) => {
    track(booking._id, "message");
    try {
      const chat = await api("/chats", { method: "POST", body: { userId: other._id } });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      navigate(`/dashboard/messages/${chat._id}`);
    } catch (err) {
      toast.error(err.message);
      untrack(booking._id);
    }
  };

  const counts = (bookings || []).reduce(
    (acc, b) => ({ ...acc, all: acc.all + 1, [b.status]: (acc[b.status] || 0) + 1 }),
    { all: 0 }
  );
  const visible = (bookings || []).filter((b) => tab === "all" || b.status === tab);

  return (
    <>
      <PageHeader
        title={isPro ? "Bookings" : "My bookings"}
        description={
          isPro
            ? "Review consultation requests from clients and keep track of upcoming meetings."
            : "Track the consultations you've requested with professionals."
        }
        actions={
          !isPro && (
            <ButtonLink to="/professionals" variant="secondary">
              Book a professional
            </ButtonLink>
          )
        }
      />

      <div role="tablist" aria-label="Filter bookings" className="scrollbar-thin -mx-4 mb-5 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
              tab === t.key ? "bg-ink text-canvas" : "text-ink-soft hover:bg-muted"
            )}
          >
            {t.label}
            <span className={clsx("rounded-full px-1.5 text-xs", tab === t.key ? "bg-canvas/20" : "bg-muted")}>
              {counts[t.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !visible.length ? (
        <EmptyState
          icon={CalendarDays}
          title={tab === "all" ? "No bookings yet" : `No ${tab} bookings`}
          description={
            tab !== "all"
              ? "Bookings with this status will show up here."
              : isPro
                ? "When clients book one of your availability slots, the request appears here."
                : "Find a professional and book a consultation from their profile."
          }
          action={
            tab === "all" &&
            (isPro ? (
              <ButtonLink to="/dashboard/availability">Add availability</ButtonLink>
            ) : (
              <ButtonLink to="/professionals">Find professionals</ButtonLink>
            ))
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              isPro={isPro}
              busy={busy[b._id]}
              onStatus={onStatus}
              onRemove={onRemove}
              onMessage={(other) => onMessage(b, other)}
            />
          ))}
        </div>
      )}
    </>
  );
}
