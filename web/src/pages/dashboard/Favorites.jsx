import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { api } from "../../lib/api";
import { plural } from "../../lib/format";
import { useFavorites } from "../../hooks/useFavorites";
import { DesignCard, DesignCardSkeleton } from "../../components/DesignCard";
import { ButtonLink, EmptyState, ErrorState, PageHeader } from "../../components/ui";

export default function Favorites() {
  const { isFavorite, toggle } = useFavorites();
  const { data: designs, isLoading, error, refetch } = useQuery({
    queryKey: ["favorites", "list"],
    queryFn: () => api("/favorites"),
  });

  return (
    <>
      <PageHeader
        title="Saved designs"
        description={designs?.length ? `${plural(designs.length, "design")} saved for later` : "Designs you save will appear here."}
        actions={
          designs?.length > 0 && (
            <ButtonLink to="/designs" variant="secondary">
              Browse more
            </ButtonLink>
          )
        }
      />
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <DesignCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !designs.length ? (
        <EmptyState
          icon={Heart}
          title="No saved designs yet"
          description="Tap the heart on any design to save it here and compare later."
          action={<ButtonLink to="/designs">Explore designs</ButtonLink>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {designs.map((d) => (
            <DesignCard key={d._id} design={d} isFavorite={isFavorite(d._id)} onToggleFavorite={toggle} />
          ))}
        </div>
      )}
    </>
  );
}
