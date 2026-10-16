import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Eye, LayoutGrid, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, fileUrl } from "../../../lib/api";
import { formatArea, formatDate, formatNPR } from "../../../lib/format";
import {
  Badge,
  buttonClass,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
  StarRating,
  useConfirm,
} from "../../../components/ui";

const useDebounced = (value, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

export default function Designs() {
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const q = useDebounced(search.trim());

  useEffect(() => {
    setPage(1);
  }, [q, category]);

  const params = { q, category, page, limit: 24 };
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["designs", params],
    queryFn: () => api("/designs", { params }),
    placeholderData: keepPreviousData,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["designs", "categories"],
    queryFn: () => api("/designs/categories"),
    staleTime: Infinity,
  });

  const remove = useMutation({
    mutationFn: (id) => api(`/designs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Design deleted");
      queryClient.invalidateQueries({ queryKey: ["designs"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const onDelete = async (d) => {
    const ok = await confirm({
      title: `Delete "${d.designName}"?`,
      description: `This permanently removes the design by ${d.designer_name}, including its images, ratings and comments.`,
      confirmLabel: "Delete design",
      tone: "danger",
    });
    if (ok) remove.mutate(d._id);
  };

  const actions = (d) => (
    <div className="flex justify-end gap-1">
      <Link to={`/designs/${d._id}`} aria-label={`View ${d.designName}`} title="View" className={buttonClass({ variant: "ghost", size: "icon" })}>
        <Eye className="h-4 w-4" />
      </Link>
      <IconButton label={`Delete ${d.designName}`} variant="danger-ghost" disabled={remove.isPending} onClick={() => onDelete(d)}>
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
  );

  const items = data?.items || [];

  return (
    <>
      <PageHeader eyebrow="Admin" title="Designs" description="Review and moderate every published design." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            icon={Search}
            type="search"
            placeholder="Search by name, designer or description"
            aria-label="Search designs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-52">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !items.length ? (
        <EmptyState icon={LayoutGrid} title="No designs found" description="Try a different search or category." />
      ) : (
        <div className={clsx("space-y-5 transition-opacity", isFetching && "opacity-60")}>
          <p className="text-xs font-semibold text-ink-faint">{data.total} designs</p>

          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-muted/50 text-xs font-bold uppercase tracking-wider text-ink-faint">
                <tr>
                  <th className="px-4 py-3">Design</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Estimate</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((d) => (
                  <tr key={d._id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {d.designImages?.[0] ? (
                          <img src={fileUrl(d.designImages[0])} alt="" className="h-11 w-16 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <span className="h-11 w-16 shrink-0 rounded-lg bg-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{d.designName}</p>
                          <p className="truncate text-xs text-ink-faint">
                            by {d.designer_name} · {formatArea(d.area)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{d.designCategory}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatNPR(d.estimateCost)}</td>
                    <td className="px-4 py-3">
                      <StarRating value={d.averageRating} count={d.totalRatings} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{formatDate(d.createdAt)}</td>
                    <td className="px-4 py-3">{actions(d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {items.map((d) => (
              <li key={d._id} className="card flex gap-3 p-3">
                {d.designImages?.[0] ? (
                  <img src={fileUrl(d.designImages[0])} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="h-20 w-24 shrink-0 rounded-lg bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.designName}</p>
                  <p className="truncate text-xs text-ink-faint">by {d.designer_name}</p>
                  <p className="mt-1 text-xs font-semibold text-brand">{formatNPR(d.estimateCost)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge>{d.designCategory}</Badge>
                    <StarRating value={d.averageRating} />
                  </div>
                </div>
                {actions(d)}
              </li>
            ))}
          </ul>

          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </div>
      )}
    </>
  );
}
