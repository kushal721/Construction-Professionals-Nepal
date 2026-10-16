import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { api, fileUrl } from "../../lib/api";
import { formatNPR } from "../../lib/format";
import { Button, ErrorState, Field, Input, PageHeader, Select, Spinner, Textarea } from "../../components/ui";

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_DESCRIPTION = 3000;

const EMPTY = { designName: "", designCategory: "", area: "", estimateCost: "", designDescription: "" };

function validate(values, imageCount) {
  const errors = {};
  if (!values.designName.trim()) errors.designName = "Give your design a name";
  if (!values.designCategory) errors.designCategory = "Choose a category";
  if (!(Number(values.area) > 0)) errors.area = "Enter the built-up area in sq ft";
  if (!(Number(values.estimateCost) > 0)) errors.estimateCost = "Enter an estimated cost";
  if (values.designDescription.trim().length < 20) errors.designDescription = "Describe the design in at least 20 characters";
  if (values.designDescription.length > MAX_DESCRIPTION) errors.designDescription = "Description is too long";
  if (!imageCount) errors.images = "Add at least one image";
  return errors;
}

function ImageManager({ existing, added, onRemoveExisting, onRemoveAdded, onAddFiles, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const total = existing.length + added.length;
  const tiles = [
    ...existing.map((path) => ({ key: path, src: fileUrl(path), remove: () => onRemoveExisting(path) })),
    ...added.map((a) => ({ key: a.id, src: a.url, remove: () => onRemoveAdded(a.id) })),
  ];

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onAddFiles([...e.dataTransfer.files]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">Images</p>
        <p className="text-xs text-ink-faint">
          {total}/{MAX_FILES} · JPG, PNG or WEBP up to 5MB
        </p>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={clsx(
          "rounded-2xl border-2 border-dashed p-4 transition",
          dragging ? "border-brand bg-brand-soft/40" : error ? "border-danger/50" : "border-line"
        )}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((t, i) => (
            <div key={t.key} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
              <img src={t.src} alt={`Design image ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-brand-ink">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={t.remove}
                aria-label={`Remove image ${i + 1}`}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-white transition hover:bg-danger"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {total < MAX_FILES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-muted/50 text-ink-soft transition hover:border-brand hover:text-brand"
            >
              <ImagePlus className="h-6 w-6" aria-hidden />
              <span className="text-xs font-semibold">Add images</span>
              <span className="hidden text-[11px] text-ink-faint sm:block">or drop them here</span>
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={TYPES.join(",")}
          multiple
          className="sr-only"
          aria-label="Upload design images"
          onChange={(e) => {
            onAddFiles([...e.target.files]);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      {total > 1 && <p className="text-xs text-ink-faint">The first image is used as the cover.</p>}
    </div>
  );
}

export default function DesignForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState(EMPTY);
  const [existing, setExisting] = useState([]);
  const [added, setAdded] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const addedRef = useRef(added);
  addedRef.current = added;

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => api("/designs/categories") });
  const designQuery = useQuery({
    queryKey: ["design", id],
    queryFn: () => api(`/designs/${id}`),
    enabled: isEdit,
  });

  useEffect(() => {
    const d = designQuery.data;
    if (!d) return;
    setValues({
      designName: d.designName || "",
      designCategory: d.designCategory || "",
      area: String(d.area ?? ""),
      estimateCost: String(d.estimateCost ?? ""),
      designDescription: d.designDescription || "",
    });
    setExisting(d.designImages || []);
  }, [designQuery.data]);

  // Revoke preview URLs when the form unmounts.
  useEffect(() => () => addedRef.current.forEach((a) => URL.revokeObjectURL(a.url)), []);

  useEffect(() => {
    if (submitted) setErrors(validate(values, existing.length + added.length));
  }, [values, existing, added, submitted]);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const addFiles = (files) => {
    const room = MAX_FILES - existing.length - added.length;
    const accepted = [];
    for (const f of files) {
      if (!TYPES.includes(f.type)) {
        toast.error(`${f.name}: only JPG, PNG or WEBP images are supported`);
      } else if (f.size > MAX_SIZE) {
        toast.error(`${f.name} is larger than 5MB`);
      } else {
        accepted.push(f);
      }
    }
    if (accepted.length > room) toast.error(`You can add up to ${MAX_FILES} images`);
    setAdded((prev) => [
      ...prev,
      ...accepted.slice(0, Math.max(0, room)).map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeAdded = (removeId) =>
    setAdded((prev) => {
      const target = prev.find((a) => a.id === removeId);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((a) => a.id !== removeId);
    });

  const save = useMutation({
    mutationFn: (body) => api(isEdit ? `/designs/${id}` : "/designs", { method: isEdit ? "PATCH" : "POST", body }),
    onSuccess: (res) => {
      toast.success(res?.message || (isEdit ? "Design updated" : "Design published"));
      queryClient.invalidateQueries({ queryKey: ["my-designs"] });
      queryClient.invalidateQueries({ queryKey: ["stats", "dashboard"] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ["design", id] });
      navigate("/dashboard/designs");
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(values, existing.length + added.length);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, typeof v === "string" ? v.trim() : v));
    added.forEach((a) => fd.append("designImages", a.file));
    if (isEdit) fd.append("keepImages", JSON.stringify(existing));
    save.mutate(fd);
  };

  if (isEdit && designQuery.isLoading) return <Spinner />;
  if (isEdit && designQuery.error) return <ErrorState error={designQuery.error} onRetry={designQuery.refetch} />;

  return (
    <>
      <Link to="/dashboard/designs" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> My designs
      </Link>
      <PageHeader
        title={isEdit ? "Edit design" : "Publish a design"}
        description={isEdit ? "Update the details and images of your design." : "Share a house design with clients across Nepal."}
      />

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card space-y-5 p-5 sm:p-6">
          <Field label="Design name" error={errors.designName}>
            <Input value={values.designName} onChange={set("designName")} placeholder="e.g. Courtyard Family Home" maxLength={120} />
          </Field>
          <Field label="Category" error={errors.designCategory}>
            <Select value={values.designCategory} onChange={set("designCategory")}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Built-up area (sq ft)" error={errors.area}>
              <Input type="number" inputMode="numeric" min="1" value={values.area} onChange={set("area")} placeholder="2400" />
            </Field>
            <Field
              label="Estimated cost (NPR)"
              error={errors.estimateCost}
              hint={Number(values.estimateCost) > 0 ? `≈ ${formatNPR(values.estimateCost)}` : "Total build cost in rupees"}
            >
              <Input type="number" inputMode="numeric" min="1" value={values.estimateCost} onChange={set("estimateCost")} placeholder="8500000" />
            </Field>
          </div>
          <Field
            label="Description"
            error={errors.designDescription}
            hint="Layout, number of rooms, materials, plot requirements…"
            action={
              <span className={clsx("text-xs", values.designDescription.length > MAX_DESCRIPTION ? "text-danger" : "text-ink-faint")}>
                {values.designDescription.length}/{MAX_DESCRIPTION}
              </span>
            }
          >
            <Textarea rows={7} value={values.designDescription} onChange={set("designDescription")} />
          </Field>
          <ImageManager
            existing={existing}
            added={added}
            onRemoveExisting={(p) => setExisting((prev) => prev.filter((x) => x !== p))}
            onRemoveAdded={removeAdded}
            onAddFiles={addFiles}
            error={errors.images}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="font-sans text-sm font-bold">Ready to {isEdit ? "save" : "publish"}?</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {isEdit
                ? "Changes are visible on the marketplace immediately."
                : "Your design will be listed on the marketplace and on your public profile."}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button type="submit" loading={save.isPending}>
                {isEdit ? "Save changes" : "Publish design"}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/dashboard/designs")}>
                Cancel
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-muted p-5 text-sm text-ink-soft">
            <p className="font-semibold text-ink">Tips</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Use a bright exterior shot as the cover.</li>
              <li>Include floor plans so clients understand the layout.</li>
              <li>Mention the minimum plot size (in aana) it fits.</li>
            </ul>
          </div>
        </aside>
      </form>
    </>
  );
}
