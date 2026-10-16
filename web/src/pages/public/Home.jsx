import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck, MessageSquare, Search, Ruler } from "lucide-react";
import { api } from "../../lib/api";
import { useFavorites } from "../../hooks/useFavorites";
import { DesignCard, DesignCardSkeleton } from "../../components/DesignCard";
import { ProfessionalCard } from "../../components/ProfessionalCard";
import { Button, ButtonLink, Skeleton } from "../../components/ui";

const STEPS = [
  {
    icon: Search,
    title: "Browse designs",
    text: "Explore house plans and interiors with real cost estimates and floor areas from local professionals.",
  },
  {
    icon: MessageSquare,
    title: "Talk to the designer",
    text: "Message architects, engineers and contractors directly to ask questions or adapt a design to your plot.",
  },
  {
    icon: CalendarCheck,
    title: "Book a consultation",
    text: "Pick a time from their published availability. They confirm, and you meet at their office or on site.",
  },
];

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function Stat({ value, label, loading }) {
  return (
    <div>
      {loading ? (
        <Skeleton className="h-9 w-16" />
      ) : (
        <p className="font-display text-3xl font-semibold sm:text-4xl">{value.toLocaleString("en-IN")}</p>
      )}
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { isFavorite, toggle } = useFavorites();

  const stats = useQuery({ queryKey: ["stats", "public"], queryFn: () => api("/stats/public") });
  const topDesigns = useQuery({
    queryKey: ["designs", { sort: "rating", limit: 6 }],
    queryFn: () => api("/designs", { params: { sort: "rating", limit: 6 } }),
  });
  const pros = useQuery({ queryKey: ["professionals", {}], queryFn: () => api("/professionals") });

  const featured = [...(pros.data || [])].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3);
  const categories = Object.entries(stats.data?.categories || {}).sort((a, b) => b[1] - a[1]);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/designs?q=${encodeURIComponent(q.trim())}` : "/designs");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div className="animate-fade-up">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
              Architects, engineers & builders across Nepal
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Design the home you'll <em className="font-medium italic text-brand">grow old</em> in.
            </h1>
            <p className="mt-5 max-w-xl text-base text-ink-soft sm:text-lg">
              Find house designs with honest cost estimates, then work directly with the professionals who drew them —
              from first sketch to the final brick.
            </p>

            <form onSubmit={onSearch} className="mt-8 flex max-w-xl gap-2 rounded-2xl border border-line bg-surface p-1.5 shadow-card" role="search">
              <label htmlFor="hero-search" className="sr-only">
                Search designs
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
                <input
                  id="hero-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Try “courtyard”, “villa” or “Newari”"
                  className="h-11 w-full rounded-xl border-0 bg-transparent pl-10 pr-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-0"
                />
              </div>
              <Button type="submit" size="md" className="h-11">
                Search
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link to="/professionals" className="link inline-flex items-center gap-1">
                Find a professional <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/designs" className="font-semibold text-ink-soft hover:text-ink">
                Browse all designs
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              <Stat value={stats.data?.designs ?? 0} label="Designs" loading={stats.isLoading} />
              <Stat value={stats.data?.professionals ?? 0} label="Professionals" loading={stats.isLoading} />
              <Stat value={stats.data?.bookings ?? 0} label="Consultations" loading={stats.isLoading} />
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]">
              <img src="/hero.jpg" alt="Contemporary family home at dusk" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 sm:p-6">
                <p className="font-display text-lg text-white sm:text-xl">Courtyard Family Home</p>
                <p className="text-sm text-white/80">2,400 sq ft · Lalitpur</p>
              </div>
            </div>
            <div className="absolute -left-4 top-8 hidden rounded-2xl border border-line bg-surface p-4 shadow-lift sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Ruler className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs text-ink-faint">Built to</p>
                  <p className="text-sm font-bold">NBC 105 seismic code</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-page pt-14">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-semibold text-ink-faint">Popular styles</span>
            {categories.map(([name, count]) => (
              <Link
                key={name}
                to={`/designs?category=${encodeURIComponent(name)}`}
                className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-brand hover:text-brand"
              >
                {name} <span className="text-ink-faint">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top rated designs */}
      <section className="container-page pt-16">
        <SectionHeading
          eyebrow="Loved by homeowners"
          title="Top rated designs"
          action={
            <ButtonLink to="/designs?sort=rating" variant="secondary">
              See all designs <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topDesigns.isLoading
            ? Array.from({ length: 6 }, (_, i) => <DesignCardSkeleton key={i} />)
            : topDesigns.data?.items.map((d) => (
                <DesignCard key={d._id} design={d} isFavorite={isFavorite(d._id)} onToggleFavorite={toggle} />
              ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-24 border-y border-line bg-surface">
        <div className="container-page py-16">
          <SectionHeading eyebrow="How it works" title="From idea to site visit in three steps" />
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Step {i + 1}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-ink">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="font-sans text-lg font-bold">{title}</h3>
                </div>
                <p className="mt-3 text-sm text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured professionals */}
      <section className="container-page pt-20">
        <SectionHeading
          eyebrow="Meet the experts"
          title="Featured professionals"
          action={
            <ButtonLink to="/professionals" variant="secondary">
              All professionals <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pros.isLoading
            ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-48" />)
            : featured.map((p) => <ProfessionalCard key={p._id} pro={p} />)}
        </div>
      </section>

      {/* CTA for professionals */}
      <section className="container-page pt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-canvas sm:px-12 sm:py-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/40 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand">For professionals</p>
              <h2 className="text-3xl font-semibold sm:text-4xl">Show your work to families ready to build.</h2>
              <p className="mt-4 max-w-xl text-canvas/75">
                Publish your designs, set your consultation hours and manage bookings and client messages in one place.
                It's free to join.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <ButtonLink to="/register?role=professional" size="lg">
                Join as a professional
              </ButtonLink>
              <ButtonLink to="/about" size="lg" variant="ghost" className="border border-canvas/30 !text-canvas hover:bg-canvas/10">
                Learn more
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
