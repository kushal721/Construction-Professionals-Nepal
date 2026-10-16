import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Search, Users } from "lucide-react";
import { api } from "../../lib/api";
import { ProfessionalCard } from "../../components/ProfessionalCard";
import { Button, EmptyState, ErrorState, Input, PageHeader, Skeleton } from "../../components/ui";

const SPECIALIZATIONS = ["Architect", "Civil Engineer", "Interior Designer", "Contractor"];

export default function Professionals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const specialization = searchParams.get("specialization") || "";
  const [search, setSearch] = useState(q);

  const update = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim() !== q) update({ q: search.trim() });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  const params = { q, specialization };
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useQuery({
    queryKey: ["professionals", params],
    queryFn: () => api("/professionals", { params }),
    placeholderData: keepPreviousData,
  });

  const chip = (value, label) => (
    <button
      key={label}
      onClick={() => update({ specialization: value })}
      aria-pressed={specialization === value}
      className={clsx(
        "rounded-full border px-4 py-2 text-sm font-semibold transition",
        specialization === value
          ? "border-brand bg-brand text-brand-ink"
          : "border-line bg-surface text-ink-soft hover:border-brand hover:text-brand"
      )}
    >
      {label}
    </button>
  );

  const filtered = q || specialization;

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Directory"
        title="Find a professional"
        description="Architects, engineers, interior designers and contractors who publish their work and availability."
      />

      <div className="max-w-xl">
        <label htmlFor="pro-search" className="sr-only">
          Search professionals
        </label>
        <Input
          id="pro-search"
          type="search"
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, city or skill"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by specialization">
        {chip("", "All")}
        {SPECIALIZATIONS.map((s) => chip(s, s))}
      </div>

      <div className="mt-8" aria-live="polite">
        {isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-52" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={Users}
            title={filtered ? "No professionals match" : "No professionals yet"}
            description={filtered ? "Try a different search or specialization." : "Check back soon as new professionals join."}
            action={
              filtered && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setSearchParams({}, { replace: true });
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-ink-soft">
              <span className="font-bold text-ink">{data.length}</span> {data.length === 1 ? "professional" : "professionals"}
            </p>
            <div className={clsx("grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3", isPlaceholderData && "opacity-60")}>
              {data.map((p) => (
                <ProfessionalCard key={p._id} pro={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
