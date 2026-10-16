import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "../../lib/api";
import { formatNPR } from "../../lib/format";
import { useFavorites } from "../../hooks/useFavorites";
import { DesignCard, DesignCardSkeleton } from "../../components/DesignCard";
import { Button, EmptyState, ErrorState, Input, PageHeader, Pagination, Select } from "../../components/ui";

const SORTS = [
  ["newest", "Newest first"],
  ["rating", "Highest rated"],
  ["popular", "Most reviewed"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["area-asc", "Area: small to large"],
  ["area-desc", "Area: large to small"],
];

const COST_PRESETS = [
  { label: "Under 50 Lakh", min: "", max: "5000000" },
  { label: "50 Lakh – 1 Cr", min: "5000000", max: "10000000" },
  { label: "1 – 2 Cr", min: "10000000", max: "20000000" },
  { label: "2 Cr+", min: "20000000", max: "" },
];

const AREA_PRESETS = [
  { label: "Under 1,500 sq ft", min: "", max: "1500" },
  { label: "1,500 – 2,500 sq ft", min: "1500", max: "2500" },
  { label: "2,500 – 5,000 sq ft", min: "2500", max: "5000" },
  { label: "5,000+ sq ft", min: "5000", max: "" },
];

const KEYS = ["q", "category", "minCost", "maxCost", "minArea", "maxArea", "sort", "page"];

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "rounded-lg px-3 py-2 text-left text-sm font-medium transition",
        active ? "bg-brand-soft font-semibold text-brand" : "text-ink-soft hover:bg-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({ title, children }) {
  return (
    <fieldset className="border-b border-line pb-5 last:border-0">
      <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-faint">{title}</legend>
      <div className="flex flex-col gap-0.5">{children}</div>
    </fieldset>
  );
}

export default function Designs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => Object.fromEntries(KEYS.map((k) => [k, searchParams.get(k) || ""])), [searchParams]);
  const page = Number(params.page) || 1;
  const sort = params.sort || "newest";

  const [search, setSearch] = useState(params.q);
  const debounced = useDebounced(search);
  const [showFilters, setShowFilters] = useState(false);
  const { isFavorite, toggle } = useFavorites();

  const update = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (resetPage) next.delete("page");
    setSearchParams(next, { replace: true });
  };

  // Push the debounced search term into the URL.
  useEffect(() => {
    if (debounced !== params.q) update({ q: debounced.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Keep the input in sync when the URL changes externally (e.g. back button).
  useEffect(() => {
    setSearch(params.q);
  }, [params.q]);

  const categories = useQuery({
    queryKey: ["designs", "categories"],
    queryFn: () => api("/designs/categories"),
    staleTime: Infinity,
  });

  const query = { ...params, sort, page, limit: 12 };
  const designs = useQuery({
    queryKey: ["designs", query],
    queryFn: () => api("/designs", { params: query }),
    placeholderData: keepPreviousData,
  });

  const costActive = (p) => params.minCost === p.min && params.maxCost === p.max;
  const areaActive = (p) => params.minArea === p.min && params.maxArea === p.max;

  const chips = [
    params.q && { key: "q", label: `“${params.q}”`, clear: { q: "" } },
    params.category && { key: "category", label: params.category, clear: { category: "" } },
    (params.minCost || params.maxCost) && {
      key: "cost",
      label: COST_PRESETS.find(costActive)?.label || `${params.minCost ? formatNPR(params.minCost) : "Any"} – ${params.maxCost ? formatNPR(params.maxCost) : "Any"}`,
      clear: { minCost: "", maxCost: "" },
    },
    (params.minArea || params.maxArea) && {
      key: "area",
      label: AREA_PRESETS.find(areaActive)?.label || `${params.minArea || 0}–${params.maxArea || "∞"} sq ft`,
      clear: { minArea: "", maxArea: "" },
    },
  ].filter(Boolean);

  const clearAll = () => {
    setSearch("");
    setSearchParams(sort !== "newest" ? { sort } : {}, { replace: true });
  };

  const filters = (
    <div className="space-y-5">
      <FilterGroup title="Category">
        <Chip active={!params.category} onClick={() => update({ category: "" })}>
          All categories
        </Chip>
        {(categories.data || []).map((c) => (
          <Chip key={c} active={params.category === c} onClick={() => update({ category: params.category === c ? "" : c })}>
            {c}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Estimated cost">
        {COST_PRESETS.map((p) => (
          <Chip
            key={p.label}
            active={costActive(p)}
            onClick={() => update(costActive(p) ? { minCost: "", maxCost: "" } : { minCost: p.min, maxCost: p.max })}
          >
            {p.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Floor area">
        {AREA_PRESETS.map((p) => (
          <Chip
            key={p.label}
            active={areaActive(p)}
            onClick={() => update(areaActive(p) ? { minArea: "", maxArea: "" } : { minArea: p.min, maxArea: p.max })}
          >
            {p.label}
          </Chip>
        ))}
      </FilterGroup>
    </div>
  );

  const data = designs.data;

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Design library"
        title="House designs"
        description="Plans and interiors from verified Nepali professionals, with cost estimates you can actually plan around."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="design-search" className="sr-only">
            Search designs
          </label>
          <Input
            id="design-search"
            icon={Search}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, style or designer"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="lg:hidden"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            aria-controls="mobile-filters"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
            {chips.length > 0 && (
              <span className="rounded-full bg-brand px-1.5 text-[11px] text-brand-ink">{chips.length}</span>
            )}
          </Button>
          <label htmlFor="design-sort" className="sr-only">
            Sort by
          </label>
          <Select id="design-sort" value={sort} onChange={(e) => update({ sort: e.target.value === "newest" ? "" : e.target.value })} className="sm:w-52">
            {SORTS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {showFilters && (
        <div id="mobile-filters" className="card mt-4 p-5 lg:hidden">
          {filters}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24">{filters}</div>
        </aside>

        <section aria-live="polite" aria-busy={designs.isFetching}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-ink-soft">
              {data ? (
                <>
                  <span className="font-bold text-ink">{data.total}</span> {data.total === 1 ? "design" : "designs"}
                </>
              ) : (
                "Loading designs…"
              )}
            </p>
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  if (c.key === "q") setSearch("");
                  update(c.clear);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1 pl-3 pr-2 text-xs font-semibold text-ink-soft hover:border-brand hover:text-brand"
                aria-label={`Remove filter ${c.label}`}
              >
                {c.label} <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ))}
            {chips.length > 1 && (
              <button onClick={clearAll} className="text-xs font-semibold text-brand hover:underline">
                Clear all
              </button>
            )}
          </div>

          {designs.isError ? (
            <ErrorState error={designs.error} onRetry={designs.refetch} />
          ) : designs.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <DesignCardSkeleton key={i} />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title="No designs match your filters"
              description="Try a broader search or remove a filter or two."
              action={
                chips.length > 0 && (
                  <Button variant="secondary" onClick={clearAll}>
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className={clsx("grid gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3", designs.isPlaceholderData && "opacity-60")}>
                {data.items.map((d) => (
                  <DesignCard key={d._id} design={d} isFavorite={isFavorite(d._id)} onToggleFavorite={toggle} />
                ))}
              </div>
              <div className="mt-10">
                <Pagination
                  page={data.page}
                  pages={data.pages}
                  onChange={(p) => {
                    update({ page: p > 1 ? String(p) : "" }, { resetPage: false });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
