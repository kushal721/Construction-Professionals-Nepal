import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { ExternalLink, Search, Trash2, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../lib/api";
import { formatDate } from "../../../lib/format";
import { useAuth } from "../../../context/AuthContext";
import {
  Avatar,
  Badge,
  buttonClass,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  PageHeader,
  Skeleton,
  useConfirm,
} from "../../../components/ui";

const TABS = [
  { value: "", label: "All" },
  { value: "client", label: "Clients" },
  { value: "professional", label: "Professionals" },
  { value: "admin", label: "Admins" },
];
const ROLE_TONE = { admin: "danger", professional: "brand", client: "info" };

const useDebounced = (value, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

export default function Users() {
  const { user: me } = useAuth();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const params = { role, q };

  const { data: users, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => api("/users", { params }),
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: (id) => api(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const onDelete = async (u) => {
    const ok = await confirm({
      title: `Delete ${u.username}?`,
      description:
        u.role === "professional"
          ? "This permanently removes the account along with their designs, availability and bookings."
          : "This permanently removes the account, their bookings and saved designs.",
      confirmLabel: "Delete user",
      tone: "danger",
    });
    if (ok) remove.mutate(u._id);
  };

  const actions = (u) => (
    <div className="flex justify-end gap-1">
      {u.role === "professional" && (
        <Link
          to={`/professionals/${u._id}`}
          aria-label={`View ${u.username}'s public profile`}
          title="View public profile"
          className={buttonClass({ variant: "ghost", size: "icon" })}
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}
      <IconButton
        label={u._id === me._id ? "You can't delete your own account" : `Delete ${u.username}`}
        variant="danger-ghost"
        disabled={u._id === me._id || remove.isPending}
        onClick={() => onDelete(u)}
      >
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
  );

  return (
    <>
      <PageHeader eyebrow="Admin" title="Users" description="Everyone with an account on the platform." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1" role="tablist" aria-label="Filter by role">
          {TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={role === t.value}
              onClick={() => setRole(t.value)}
              className={clsx(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                role === t.value ? "bg-ink text-canvas" : "text-ink-soft hover:bg-muted"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="sm:w-72">
          <Input
            icon={Search}
            type="search"
            placeholder="Search name, email, location"
            aria-label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !users.length ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Try a different search or role filter." />
      ) : (
        <div className={clsx("transition-opacity", isFetching && "opacity-60")}>
          <p className="mb-2 text-xs font-semibold text-ink-faint">{users.length} users</p>

          {/* Desktop table */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-muted/50 text-xs font-bold uppercase tracking-wider text-ink-faint">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {u.username}
                            {u._id === me._id && <span className="ml-1.5 text-xs font-normal text-ink-faint">(you)</span>}
                          </p>
                          <p className="truncate text-xs text-ink-faint">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={ROLE_TONE[u.role]} className="capitalize">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{u.location || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{u.createdAt ? formatDate(u.createdAt) : "—"}</td>
                    <td className="px-4 py-3">{actions(u)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {users.map((u) => (
              <li key={u._id} className="card flex items-start gap-3 p-4">
                <Avatar user={u} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{u.username}</p>
                  <p className="truncate text-xs text-ink-faint">{u.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                    <Badge tone={ROLE_TONE[u.role]} className="capitalize">
                      {u.role}
                    </Badge>
                    {u.location && <span>{u.location}</span>}
                    {u.createdAt && <span>Joined {formatDate(u.createdAt)}</span>}
                  </div>
                </div>
                {actions(u)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
