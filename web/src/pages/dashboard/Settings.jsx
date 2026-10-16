import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Avatar, Badge, Button, Field, Input, PageHeader, PasswordInput, Select, Skeleton, Textarea } from "../../components/ui";

const SPECIALIZATIONS = [
  "Architect",
  "Civil Engineer",
  "Structural Engineer",
  "Interior Designer",
  "Contractor",
  "Landscape Architect",
];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function Section({ title, description, children, aside }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-lg font-bold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ProfileSection() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [values, setValues] = useState({
    username: user.username || "",
    email: user.email || "",
    contactNumber: user.contactNumber || "",
    location: user.location || "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) return toast.error("Use a JPG, PNG or WEBP image");
    if (f.size > 5 * 1024 * 1024) return toast.error("Image must be 5MB or smaller");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = useMutation({
    mutationFn: (body) => api("/users/me", { method: "PUT", body }),
    onSuccess: ({ user: updated, message }) => {
      setUser(updated);
      setFile(null);
      setPreview(null);
      toast.success(message || "Profile updated");
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      queryClient.invalidateQueries({ queryKey: ["my-designs"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.username.trim()) errs.username = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errs.email = "Enter a valid email";
    if (values.contactNumber && !/^[+\d][\d\s-]{6,}$/.test(values.contactNumber.trim())) errs.contactNumber = "Enter a valid phone number";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v.trim()));
    if (file) fd.append("profile", file);
    save.mutate(fd);
  };

  return (
    <Section title="Profile" description="How you appear to others on ConstructionPro.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="flex items-center gap-4">
          {preview ? (
            <img src={preview} alt="New profile photo preview" className="h-24 w-24 rounded-full object-cover ring-1 ring-line" />
          ) : (
            <Avatar user={user} size="xl" />
          )}
          <div>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Camera className="h-4 w-4" /> {user.profile || preview ? "Change photo" : "Upload photo"}
            </Button>
            <p className="mt-1.5 text-xs text-ink-faint">JPG, PNG or WEBP, up to 5MB.</p>
            <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(",")} className="sr-only" aria-label="Profile photo" onChange={pickFile} />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.username}>
            <Input value={values.username} onChange={set("username")} autoComplete="name" />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input type="email" value={values.email} onChange={set("email")} autoComplete="email" />
          </Field>
          <Field label="Phone" optional error={errors.contactNumber}>
            <Input type="tel" value={values.contactNumber} onChange={set("contactNumber")} placeholder="98XXXXXXXX" autoComplete="tel" />
          </Field>
          <Field label="Location" optional>
            <Input value={values.location} onChange={set("location")} placeholder="e.g. Lalitpur" autoComplete="address-level2" />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={save.isPending}>
            Save profile
          </Button>
        </div>
      </form>
    </Section>
  );
}

function ProfessionalSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["pro-details"], queryFn: () => api("/professionals/me/details") });
  const [values, setValues] = useState(null);
  const [specChoice, setSpecChoice] = useState("");

  useEffect(() => {
    if (isLoading || values) return;
    const d = data || {};
    const spec = d.specialization || "";
    setSpecChoice(!spec ? "" : SPECIALIZATIONS.includes(spec) ? spec : "Other");
    setValues({
      specialization: spec,
      experience: d.experience || "",
      education: d.education || "",
      skills: d.skills || "",
      description: d.description || "",
    });
  }, [data, isLoading, values]);

  const save = useMutation({
    mutationFn: (body) => api("/professionals/me/details", { method: "PUT", body }),
    onSuccess: (res) => {
      toast.success(res?.message || "Professional details saved");
      queryClient.setQueryData(["pro-details"], res.details);
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      queryClient.invalidateQueries({ queryKey: ["professional", user._id] });
      queryClient.invalidateQueries({ queryKey: ["stats", "dashboard"] });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading || !values) {
    return (
      <Section title="Professional details">
        <Skeleton className="h-64" />
      </Section>
    );
  }

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const skills = values.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!values.specialization.trim()) {
      toast.error("Choose your specialization");
      return;
    }
    save.mutate({ ...values, skills: skills.join(", ") });
  };

  return (
    <Section
      title="Professional details"
      description="Shown on your public profile to help clients choose you."
      aside={
        <Link to={`/professionals/${user._id}`} className="link inline-flex items-center gap-1.5 text-sm">
          View public profile <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Specialization">
            <Select
              value={specChoice}
              onChange={(e) => {
                const choice = e.target.value;
                setSpecChoice(choice);
                setValues((v) => ({ ...v, specialization: choice === "Other" ? "" : choice }));
              }}
            >
              <option value="">Select…</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
              <option value="Other">Other</option>
            </Select>
          </Field>
          {specChoice === "Other" && (
            <Field label="Your specialization">
              <Input value={values.specialization} onChange={set("specialization")} placeholder="e.g. Surveyor" />
            </Field>
          )}
          <Field label="Experience">
            <Input value={values.experience} onChange={set("experience")} placeholder="e.g. 8 years" />
          </Field>
          <Field label="Education">
            <Input value={values.education} onChange={set("education")} placeholder="e.g. B.Arch, IOE Pulchowk" />
          </Field>
        </div>
        <Field label="Skills" hint="Separate skills with commas">
          <Input value={values.skills} onChange={set("skills")} placeholder="AutoCAD, Revit, Site supervision" />
        </Field>
        {skills.length > 0 && (
          <div className="-mt-2 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <Badge key={s} tone="brand">
                {s}
              </Badge>
            ))}
          </div>
        )}
        <Field label="About you" hint={`${values.description.length}/2000`}>
          <Textarea
            rows={5}
            maxLength={2000}
            value={values.description}
            onChange={set("description")}
            placeholder="What kind of projects do you take on? What makes your work different?"
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={save.isPending}>
            Save details
          </Button>
        </div>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const empty = { currentPassword: "", newPassword: "", confirm: "" };
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const save = useMutation({
    mutationFn: ({ currentPassword, newPassword }) => api("/auth/password", { method: "PUT", body: { currentPassword, newPassword } }),
    onSuccess: (res) => {
      toast.success(res?.message || "Password updated");
      setValues(empty);
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.currentPassword) errs.currentPassword = "Enter your current password";
    if (values.newPassword.length < 8) errs.newPassword = "Use at least 8 characters";
    if (values.confirm !== values.newPassword) errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (!Object.keys(errs).length) save.mutate(values);
  };

  return (
    <Section title="Change password" description="Use at least 8 characters.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field label="Current password" error={errors.currentPassword}>
          <PasswordInput value={values.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="New password" error={errors.newPassword}>
            <PasswordInput value={values.newPassword} onChange={set("newPassword")} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password" error={errors.confirm}>
            <PasswordInput value={values.confirm} onChange={set("confirm")} autoComplete="new-password" />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={save.isPending}>
            Update password
          </Button>
        </div>
      </form>
    </Section>
  );
}

export default function Settings() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader
        title={user.role === "professional" ? "Profile & settings" : "Settings"}
        description="Manage your account details and security."
      />
      <div className="space-y-6">
        <ProfileSection />
        {user.role === "professional" && <ProfessionalSection />}
        <PasswordSection />
      </div>
    </>
  );
}
