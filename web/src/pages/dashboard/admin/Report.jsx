import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { ChevronDown, Download, FileText, Printer } from "lucide-react";
import { api } from "../../../lib/api";
import { formatArea, formatDate, formatNPR, plural } from "../../../lib/format";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StarRating,
} from "../../../components/ui";

const csvCell = (v) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const buildCsv = (rows) => {
  const header = [
    "Professional",
    "Email",
    "Phone",
    "Location",
    "Specialization",
    "Experience",
    "Bookings",
    "Design",
    "Category",
    "Area (sq ft)",
    "Estimate (NPR)",
    "Average rating",
    "Ratings",
    "Design created",
  ];
  const lines = [header];
  rows.forEach(({ professional: p, details: d, designs, bookingCount }) => {
    const base = [p.username, p.email, p.contactNumber, p.location, d?.specialization, d?.experience, bookingCount];
    if (!designs.length) lines.push([...base, "", "", "", "", "", "", ""]);
    designs.forEach((x) =>
      lines.push([
        ...base,
        x.designName,
        x.designCategory,
        x.area,
        x.estimateCost,
        x.averageRating,
        x.totalRatings,
        x.createdAt ? formatDate(x.createdAt, "yyyy-MM-dd") : "",
      ])
    );
  });
  return lines.map((l) => l.map(csvCell).join(",")).join("\n");
};

const download = (filename, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

function Summary({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink-soft">{value}</dd>
    </div>
  );
}

export default function Report() {
  const [open, setOpen] = useState(() => new Set());
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "report"],
    queryFn: () => api("/admin/report"),
  });

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allOpen = data.length > 0 && open.size === data.length;

  const totalDesigns = data.reduce((a, r) => a + r.designs.length, 0);
  const totalBookings = data.reduce((a, r) => a + r.bookingCount, 0);
  const totalValue = data.reduce((a, r) => a + r.designs.reduce((s, d) => s + (d.estimateCost || 0), 0), 0);
  const withProfile = data.filter((r) => r.details).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Professional report"
        description={`Generated ${formatDate(new Date(), "d MMM yyyy, h:mm a")}`}
        actions={
          <div className="flex gap-2 print:hidden">
            <Button
              variant="secondary"
              disabled={!data.length}
              onClick={() => download(`professional-report-${formatDate(new Date(), "yyyy-MM-dd")}.csv`, buildCsv(data))}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button
              variant="secondary"
              disabled={!data.length}
              onClick={() => {
                setOpen(new Set(data.map((r) => r.professional._id)));
                setTimeout(() => window.print(), 50);
              }}
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data.length ? (
        <EmptyState icon={FileText} title="No professionals yet" description="The report fills in as professionals join." />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Summary label="Professionals" value={data.length} />
            <Summary label="Profiles completed" value={`${withProfile}/${data.length}`} />
            <Summary label="Designs" value={totalDesigns} />
            <Summary label="Bookings" value={totalBookings} />
          </div>
          <p className="mb-3 text-sm text-ink-soft">
            Combined estimated value of all designs: <strong className="text-ink">{formatNPR(totalValue)}</strong>
          </p>

          <div className="mb-3 flex justify-end print:hidden">
            <button
              className="text-xs font-semibold text-brand hover:underline"
              onClick={() => setOpen(allOpen ? new Set() : new Set(data.map((r) => r.professional._id)))}
            >
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <ul className="space-y-3">
            {data.map(({ professional: p, details: d, designs, bookingCount }) => {
              const isOpen = open.has(p._id);
              return (
                <li key={p._id} className="card overflow-hidden break-inside-avoid">
                  <button
                    onClick={() => toggle(p._id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/40"
                  >
                    <Avatar user={p} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.username}</p>
                      <p className="truncate text-xs text-ink-faint">
                        {d?.specialization || "No profile details"} {p.location && `· ${p.location}`}
                      </p>
                    </div>
                    <div className="hidden gap-2 sm:flex">
                      <Badge>{plural(designs.length, "design")}</Badge>
                      <Badge tone="info">{plural(bookingCount, "booking")}</Badge>
                    </div>
                    <ChevronDown className={clsx("h-5 w-5 text-ink-faint transition print:hidden", isOpen && "rotate-180")} aria-hidden />
                  </button>

                  {isOpen && (
                    <div className="border-t border-line p-4">
                      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailRow label="Email" value={p.email} />
                        <DetailRow label="Phone" value={p.contactNumber} />
                        <DetailRow label="Joined" value={p.createdAt && formatDate(p.createdAt)} />
                        <DetailRow label="Experience" value={d?.experience} />
                        <DetailRow label="Education" value={d?.education} />
                        <DetailRow label="Skills" value={d?.skills} />
                      </dl>
                      {d?.description && <p className="mt-4 text-sm text-ink-soft">{d.description}</p>}

                      <h3 className="mb-2 mt-5 font-sans text-sm font-bold">Designs</h3>
                      {designs.length ? (
                        <div className="overflow-x-auto rounded-xl border border-line">
                          <table className="w-full min-w-[560px] text-left text-sm">
                            <thead className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-ink-faint">
                              <tr>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2">Area</th>
                                <th className="px-3 py-2">Estimate</th>
                                <th className="px-3 py-2">Rating</th>
                                <th className="px-3 py-2">Created</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                              {designs.map((x) => (
                                  <tr key={x._id}>
                                    <td className="px-3 py-2 font-semibold">
                                      <Link to={`/designs/${x._id}`} className="hover:text-brand">
                                        {x.designName}
                                      </Link>
                                    </td>
                                    <td className="px-3 py-2 text-ink-soft">{x.designCategory}</td>
                                    <td className="whitespace-nowrap px-3 py-2 text-ink-soft">{formatArea(x.area)}</td>
                                    <td className="whitespace-nowrap px-3 py-2">{formatNPR(x.estimateCost)}</td>
                                    <td className="px-3 py-2">
                                      <StarRating value={x.averageRating} count={x.totalRatings} />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-ink-soft">{formatDate(x.createdAt)}</td>
                                  </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-ink-faint">No designs published.</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
