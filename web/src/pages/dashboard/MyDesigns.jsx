import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, LayoutGrid, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { plural } from "../../lib/format";
import { DesignCard, DesignCardSkeleton } from "../../components/DesignCard";
import { Button, ButtonLink, EmptyState, ErrorState, PageHeader, useConfirm } from "../../components/ui";

export default function MyDesigns() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: designs, isLoading, error, refetch } = useQuery({
    queryKey: ["my-designs"],
    queryFn: () => api("/designs/mine"),
  });

  const remove = useMutation({
    mutationFn: (id) => api(`/designs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Design deleted");
      queryClient.invalidateQueries({ queryKey: ["my-designs"] });
      queryClient.invalidateQueries({ queryKey: ["stats", "dashboard"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const onDelete = async (design) => {
    const ok = await confirm({
      title: "Delete this design?",
      description: `"${design.designName}" and its images, ratings and comments will be permanently removed.`,
      confirmLabel: "Delete design",
      tone: "danger",
    });
    if (ok) remove.mutate(design._id);
  };

  const rated = (designs || []).filter((d) => d.totalRatings > 0);
  const avg = rated.length ? rated.reduce((a, d) => a + d.averageRating, 0) / rated.length : 0;

  return (
    <>
      <PageHeader
        title="My designs"
        description={
          designs?.length
            ? `${plural(designs.length, "design")} published${avg ? ` · ${avg.toFixed(1)} average rating` : ""}`
            : "Publish your house designs so clients can discover your work."
        }
        actions={
          <ButtonLink to="/dashboard/designs/new">
            <Plus className="h-4 w-4" /> Publish design
          </ButtonLink>
        }
      />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <DesignCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !designs.length ? (
        <EmptyState
          icon={LayoutGrid}
          title="No designs yet"
          description="Your published designs appear on the marketplace and your public profile."
          action={
            <ButtonLink to="/dashboard/designs/new">
              <Plus className="h-4 w-4" /> Publish your first design
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {designs.map((d) => (
            <DesignCard
              key={d._id}
              design={d}
              actions={
                <>
                  <ButtonLink to={`/designs/${d._id}`} variant="ghost" size="sm" aria-label={`View ${d.designName}`}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </ButtonLink>
                  <ButtonLink to={`/dashboard/designs/${d._id}/edit`} variant="secondary" size="sm" aria-label={`Edit ${d.designName}`}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </ButtonLink>
                  <Button
                    variant="danger-ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => onDelete(d)}
                    loading={remove.isPending && remove.variables === d._id}
                    aria-label={`Delete ${d.designName}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
