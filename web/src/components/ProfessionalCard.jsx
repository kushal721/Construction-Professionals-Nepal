import { Link } from "react-router-dom";
import { Briefcase, LayoutGrid, MapPin } from "lucide-react";
import { Avatar, Badge, StarRating } from "./ui";
import { plural } from "../lib/format";

export function ProfessionalCard({ pro }) {
  const d = pro.details || {};
  return (
    <Link
      to={`/professionals/${pro._id}`}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift"
    >
      <div className="flex items-start gap-4">
        <Avatar user={pro} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-sans text-base font-bold group-hover:text-brand">{pro.username}</h3>
          {d.specialization ? (
            <Badge tone="brand" className="mt-1">
              {d.specialization}
            </Badge>
          ) : (
            <p className="mt-1 text-xs text-ink-faint">Profile in progress</p>
          )}
          <div className="mt-2">
            <StarRating value={pro.averageRating} count={pro.ratingCount} />
          </div>
        </div>
      </div>
      {d.description && <p className="mt-4 line-clamp-2 text-sm text-ink-soft">{d.description}</p>}
      <div className="mt-auto pt-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-4 text-xs font-medium text-ink-soft">
        {pro.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {pro.location}
          </span>
        )}
        {d.experience && (
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" aria-hidden /> {d.experience}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden /> {plural(pro.designCount || 0, "design")}
        </span>
      </div>
      </div>
    </Link>
  );
}
