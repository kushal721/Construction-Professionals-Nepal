import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfDay } from "date-fns";
import { CalendarClock, Clock, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { formatDay, formatTime, plural } from "../../lib/format";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Skeleton,
  useConfirm,
} from "../../components/ui";

const LOCATION_PRESETS = ["Office", "Site visit / video call"];
const EMPTY = { date: "", startTime: "10:00", endTime: "13:00", location: "" };
const todayStr = () => format(new Date(), "yyyy-MM-dd");

function validate(v, { allowPast = false } = {}) {
  const e = {};
  if (!v.date) e.date = "Pick a date";
  else if (!allowPast && v.date < todayStr()) e.date = "Date can't be in the past";
  if (!v.startTime) e.startTime = "Required";
  if (!v.endTime) e.endTime = "Required";
  if (v.startTime && v.endTime && v.endTime <= v.startTime) e.endTime = "Must be after start";
  if (!v.location.trim()) e.location = "Where will you meet?";
  return e;
}

function SlotFields({ values, setValues, errors }) {
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <Field label="Date" error={errors.date}>
        <Input type="date" min={todayStr()} value={values.date} onChange={set("date")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From" error={errors.startTime}>
          <Input type="time" step="1800" value={values.startTime} onChange={set("startTime")} />
        </Field>
        <Field label="To" error={errors.endTime}>
          <Input type="time" step="1800" value={values.endTime} onChange={set("endTime")} />
        </Field>
      </div>
      <Field label="Location" error={errors.location}>
        <Input value={values.location} onChange={set("location")} placeholder="e.g. Lalitpur office" maxLength={120} />
      </Field>
      <div className="flex flex-wrap gap-2">
        {LOCATION_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setValues((v) => ({ ...v, location: p }))}
            className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink-soft transition hover:border-brand hover:text-brand"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function SlotRow({ slot, onEdit, onDelete, past }) {
  return (
    <li className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-5">
      <span className="inline-flex min-w-[9.5rem] items-center gap-2 text-sm font-semibold">
        <Clock className="h-4 w-4 text-ink-faint" aria-hidden />
        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
      </span>
      <span className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm text-ink-soft">
        <MapPin className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
        <span className="truncate">{slot.location}</span>
      </span>
      <Badge tone={slot.bookingCount ? "brand" : "neutral"}>{plural(slot.bookingCount || 0, "booking")}</Badge>
      {!past && (
        <div className="flex gap-1">
          <IconButton label="Edit availability" size="icon-sm" onClick={() => onEdit(slot)}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton label="Delete availability" size="icon-sm" variant="danger-ghost" onClick={() => onDelete(slot)}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      )}
    </li>
  );
}

function SlotGroups({ slots, past, onEdit, onDelete }) {
  const groups = slots.reduce((acc, s) => {
    const key = format(new Date(s.date), "yyyy-MM-dd");
    (acc[key] ||= []).push(s);
    return acc;
  }, {});
  const keys = Object.keys(groups).sort((a, b) => (past ? b.localeCompare(a) : a.localeCompare(b)));
  return (
    <div className="space-y-4">
      {keys.map((k) => (
        <section key={k} className="card overflow-hidden">
          <h3 className="border-b border-line bg-muted/50 px-4 py-2.5 font-sans text-sm font-bold sm:px-5">{formatDay(groups[k][0].date)}</h3>
          <ul className="divide-y divide-line">
            {groups[k]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((s) => (
                <SlotRow key={s._id} slot={s} past={past} onEdit={onEdit} onDelete={onDelete} />
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function Availability() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [form, setForm] = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [showPast, setShowPast] = useState(false);

  const { data: slots, isLoading, error, refetch } = useQuery({ queryKey: ["slots", "mine"], queryFn: () => api("/slots/mine") });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["slots", "mine"] });
    queryClient.invalidateQueries({ queryKey: ["stats", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
  };

  const create = useMutation({
    mutationFn: (body) => api("/slots", { method: "POST", body }),
    onSuccess: () => {
      toast.success("Availability added");
      setForm((f) => ({ ...EMPTY, location: f.location }));
      setFormErrors({});
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const update = useMutation({
    mutationFn: ({ _id, ...body }) => api(`/slots/${_id}`, { method: "PATCH", body }),
    onSuccess: () => {
      toast.success("Availability updated");
      setEditing(null);
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id) => api(`/slots/${id}`, { method: "DELETE" }),
    onSuccess: (res) => {
      toast.success(res?.message || "Availability removed");
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const onCreate = (e) => {
    e.preventDefault();
    const errs = validate(form);
    setFormErrors(errs);
    if (!Object.keys(errs).length) create.mutate({ ...form, location: form.location.trim() });
  };

  const onSaveEdit = (e) => {
    e.preventDefault();
    const errs = validate(editing);
    setEditErrors(errs);
    if (!Object.keys(errs).length) update.mutate({ ...editing, location: editing.location.trim() });
  };

  const onDelete = async (slot) => {
    const ok = await confirm({
      title: "Remove this availability?",
      description: slot.bookingCount
        ? `${plural(slot.bookingCount, "active booking")} in this slot will be cancelled and the clients will see it as cancelled.`
        : "Clients will no longer be able to book this time.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (ok) remove.mutate(slot._id);
  };

  const startEdit = (s) => {
    setEditErrors({});
    setEditing({
      _id: s._id,
      date: format(new Date(s.date), "yyyy-MM-dd"),
      startTime: s.startTime,
      endTime: s.endTime,
      location: s.location,
    });
  };

  const today = startOfDay(new Date());
  const upcoming = (slots || []).filter((s) => new Date(s.date) >= today);
  const past = (slots || []).filter((s) => new Date(s.date) < today);

  return (
    <>
      <PageHeader title="Availability" description="Publish the times clients can book a consultation with you." />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <form onSubmit={onCreate} noValidate className="card space-y-4 p-5 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-sans text-base font-bold">Add availability</h2>
          <SlotFields values={form} setValues={setForm} errors={formErrors} />
          <Button type="submit" className="w-full" loading={create.isPending}>
            <Plus className="h-4 w-4" /> Add slot
          </Button>
        </form>

        <div className="min-w-0 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : (
            <>
              <section>
                <h2 className="mb-3 font-sans text-sm font-bold uppercase tracking-wider text-ink-faint">
                  Upcoming · {upcoming.length}
                </h2>
                {upcoming.length ? (
                  <SlotGroups slots={upcoming} onEdit={startEdit} onDelete={onDelete} />
                ) : (
                  <EmptyState
                    icon={CalendarClock}
                    title="No upcoming availability"
                    description="Add a time window so clients can book a consultation from your profile."
                  />
                )}
              </section>
              {past.length > 0 && (
                <section>
                  <button
                    type="button"
                    onClick={() => setShowPast((s) => !s)}
                    aria-expanded={showPast}
                    className="mb-3 font-sans text-sm font-bold uppercase tracking-wider text-ink-faint hover:text-ink"
                  >
                    Past · {past.length} {showPast ? "▾" : "▸"}
                  </button>
                  {showPast && <SlotGroups slots={past} past />}
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit availability"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-slot-form" loading={update.isPending}>
              Save changes
            </Button>
          </>
        }
      >
        {editing && (
          <form id="edit-slot-form" onSubmit={onSaveEdit} noValidate>
            <SlotFields values={editing} setValues={setEditing} errors={editErrors} />
          </form>
        )}
      </Modal>
    </>
  );
}
