import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import clsx from "clsx";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Expand,
  Heart,
  LayoutGrid,
  MapPin,
  Maximize2,
  MessageSquare,
  Pencil,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api, fileUrl } from "../../lib/api";
import { formatArea, formatDate, formatNPR, timeAgo } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import { DesignCard } from "../../components/DesignCard";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  ErrorState,
  IconButton,
  Skeleton,
  StarInput,
  StarRating,
  Textarea,
  useConfirm,
} from "../../components/ui";

function Lightbox({ images, index, onClose, onIndex }) {
  const count = images.length;
  const prev = useCallback(() => onIndex((index - 1 + count) % count), [index, count, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % count), [index, count, onIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Image viewer">
      <button
        onClick={onClose}
        autoFocus
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Close image viewer"
      >
        <X className="h-5 w-5" />
      </button>
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <img src={fileUrl(images[index])} alt={`Image ${index + 1} of ${count}`} className="max-h-[85vh] max-w-full rounded-xl object-contain" />
      <p className="absolute bottom-5 text-sm font-medium text-white/70">
        {index + 1} / {count}
      </p>
    </div>,
    document.body
  );
}

function Gallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  if (!images?.length) return <div className="aspect-[16/10] rounded-2xl bg-muted" />;
  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted"
        aria-label="Open full-screen gallery"
      >
        <img src={fileUrl(images[active])} alt={`${name}, image ${active + 1}`} className="h-full w-full object-cover" />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white opacity-90 transition group-hover:opacity-100">
          <Expand className="h-3.5 w-3.5" aria-hidden /> View {images.length > 1 ? `all ${images.length}` : "full size"}
        </span>
      </button>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={clsx(
                "h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition",
                i === active ? "ring-brand" : "ring-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={fileUrl(img)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {open && <Lightbox images={images} index={active} onIndex={setActive} onClose={() => setOpen(false)} />}
    </div>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-3.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
        <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
      </p>
      <p className="mt-1 text-base font-bold">{value}</p>
    </div>
  );
}

function RatingPanel({ design, user, location }) {
  const queryClient = useQueryClient();
  const rate = useMutation({
    mutationFn: (value) => api(`/designs/${design._id}/rating`, { method: "PUT", body: { value } }),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["design", design._id] });
      queryClient.invalidateQueries({ queryKey: ["designs"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const isOwner = user && design.user_id === user._id;
  if (isOwner) return null;

  return (
    <div className="card p-5">
      <h2 className="font-sans text-base font-bold">{design.myRating ? "Your rating" : "Rate this design"}</h2>
      {user ? (
        <>
          <p className="mt-1 text-sm text-ink-soft">
            {design.myRating ? "Tap a star to change your rating." : "Help others find great designs."}
          </p>
          <div className="mt-3">
            <StarInput value={design.myRating} onChange={(v) => rate.mutate(v)} disabled={rate.isPending} />
          </div>
        </>
      ) : (
        <p className="mt-1 text-sm text-ink-soft">
          <Link to="/login" state={{ from: location }} className="link">
            Sign in
          </Link>{" "}
          to rate this design.
        </p>
      )}
    </div>
  );
}

function Comment({ comment, design, user }) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const path = `/designs/${design._id}/comments/${comment._id}`;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["design", design._id] });

  const save = useMutation({
    mutationFn: () => api(path, { method: "PATCH", body: { content: text.trim() } }),
    onSuccess: () => {
      setEditing(false);
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });
  const remove = useMutation({
    mutationFn: () => api(path, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Comment deleted");
      refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const isAuthor = user && comment.createdBy === user._id;
  const canDelete = user && (isAuthor || design.user_id === user._id || user.role === "admin");

  const onDelete = async () => {
    const ok = await confirm({
      title: "Delete comment?",
      description: "This can't be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (ok) remove.mutate();
  };

  return (
    <li className="flex gap-3">
      <Avatar name={comment.commenterName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="text-sm font-bold">{comment.commenterName}</p>
          {comment.createdBy === design.user_id && <Badge tone="brand">Designer</Badge>}
          <p className="text-xs text-ink-faint">{timeAgo(comment.createdAt)}</p>
        </div>
        {editing ? (
          <form
            className="mt-2 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) save.mutate();
            }}
          >
            <label htmlFor={`edit-${comment._id}`} className="sr-only">
              Edit comment
            </label>
            <Textarea id={`edit-${comment._id}`} rows={3} value={text} onChange={(e) => setText(e.target.value)} />
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={save.isPending} disabled={!text.trim()}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setText(comment.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{comment.content}</p>
        )}
        {!editing && (isAuthor || canDelete) && (
          <div className="mt-1.5 flex gap-1">
            {isAuthor && (
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
              </Button>
            )}
            {canDelete && (
              <Button size="sm" variant="danger-ghost" className="h-7 px-2" onClick={onDelete} loading={remove.isPending}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function Comments({ design, user, location }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const post = useMutation({
    mutationFn: () => api(`/designs/${design._id}/comments`, { method: "POST", body: { content: text.trim() } }),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["design", design._id] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <section aria-labelledby="comments-heading" className="mt-12">
      <h2 id="comments-heading" className="text-2xl font-semibold">
        Questions & comments <span className="font-sans text-base font-medium text-ink-faint">({design.comments.length})</span>
      </h2>
      {user ? (
        <form
          className="mt-5 flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) post.mutate();
          }}
        >
          <Avatar user={user} size="sm" />
          <div className="flex-1 space-y-2">
            <label htmlFor="new-comment" className="sr-only">
              Write a comment
            </label>
            <Textarea
              id="new-comment"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask the designer a question or share your thoughts"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={post.isPending} disabled={!text.trim()}>
                Post comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm text-ink-soft">
          <Link to="/login" state={{ from: location }} className="link">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}
      {design.comments.length === 0 ? (
        <p className="mt-6 text-sm text-ink-faint">No comments yet. Be the first to ask a question.</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {design.comments.map((c) => (
            <Comment key={c._id} comment={c} design={design} user={user} />
          ))}
        </ul>
      )}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page py-10">
      <Skeleton className="h-5 w-32" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <Skeleton className="aspect-[16/10]" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </div>
  );
}

export default function DesignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();

  const { data: design, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["design", id],
    queryFn: () => api(`/designs/${id}`),
  });

  const message = useMutation({
    mutationFn: () => api("/chats", { method: "POST", body: { userId: design.designer._id } }),
    onSuccess: (chat) => navigate(`/dashboard/messages/${chat._id}`),
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <DetailSkeleton />;
  if (isError) {
    return (
      <div className="container-page py-16">
        {error.status === 404 ? (
          <EmptyState
            icon={LayoutGrid}
            title="Design not found"
            description="It may have been removed by the designer."
            action={<ButtonLink to="/designs">Browse designs</ButtonLink>}
          />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </div>
    );
  }

  const designer = design.designer;
  const isOwner = user && design.user_id === user._id;
  const fav = isFavorite(design._id);

  const onMessage = () => {
    if (!user) return navigate("/login", { state: { from: location } });
    message.mutate();
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <Link to="/designs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All designs
      </Link>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0">
          <Gallery images={design.designImages} name={design.designName} />

          <section className="mt-10" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-2xl font-semibold">
              About this design
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">{design.designDescription}</p>
          </section>

          <Comments design={design} user={user} location={location} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="flex items-start justify-between gap-3">
              <Badge tone="brand">{design.designCategory}</Badge>
              {!isOwner && user?.role !== "admin" && (
                <IconButton
                  label={fav ? "Remove from favorites" : "Save to favorites"}
                  variant="secondary"
                  aria-pressed={fav}
                  onClick={() => toggle(design._id)}
                >
                  <Heart className={clsx("h-4 w-4", fav && "fill-brand text-brand")} />
                </IconButton>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{design.designName}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-faint">
              <StarRating value={design.averageRating} count={design.totalRatings} size="lg" />
              <span aria-hidden>·</span>
              <span>Published {formatDate(design.createdAt)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Fact icon={Wallet} label="Estimated cost" value={formatNPR(design.estimateCost)} />
            <Fact icon={Maximize2} label="Floor area" value={formatArea(design.area)} />
          </div>

          {isOwner && (
            <ButtonLink to={`/dashboard/designs/${design._id}/edit`} variant="secondary" className="w-full">
              <Pencil className="h-4 w-4" aria-hidden /> Edit this design
            </ButtonLink>
          )}

          {designer && (
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Designed by</p>
              <Link to={`/professionals/${designer._id}`} className="mt-3 flex items-center gap-3 hover:text-brand">
                <Avatar user={designer} size="md" />
                <div className="min-w-0">
                  <p className="truncate font-bold">{designer.username}</p>
                  {designer.location && (
                    <p className="flex items-center gap-1 text-xs text-ink-faint">
                      <MapPin className="h-3.5 w-3.5" aria-hidden /> {designer.location}
                    </p>
                  )}
                </div>
              </Link>
              {!isOwner && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={onMessage} loading={message.isPending}>
                    <MessageSquare className="h-4 w-4" aria-hidden /> Message
                  </Button>
                  <ButtonLink to={`/professionals/${designer._id}#book`}>
                    <CalendarDays className="h-4 w-4" aria-hidden /> Book
                  </ButtonLink>
                </div>
              )}
            </div>
          )}

          <RatingPanel design={design} user={user} location={location} />
        </aside>
      </div>

      {design.related?.length > 0 && (
        <section className="mt-20" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-6 text-2xl font-semibold">
            More {design.designCategory.toLowerCase()} designs
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {design.related.map((d) => (
              <DesignCard key={d._id} design={d} isFavorite={isFavorite(d._id)} onToggleFavorite={toggle} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
