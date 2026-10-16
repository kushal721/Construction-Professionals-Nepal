import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { Camera, HardHat, Home } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Button, Field, Input, PasswordInput } from "../../components/ui";
import { AuthShell, FormError } from "./AuthShell";

const ROLES = [
  { value: "client", title: "Client", subtitle: "I want to build", icon: Home },
  { value: "professional", title: "Professional", subtitle: "I design or build", icon: HardHat },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "professional" ? "professional" : "client");
  const [form, setForm] = useState({
    username: "",
    email: "",
    contactNumber: "",
    location: "",
    password: "",
    confirm: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!photo) return undefined;
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.confirm !== form.password) next.confirm = "Passwords don't match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    const data = new FormData();
    data.append("role", role);
    data.append("username", form.username.trim());
    data.append("email", form.email.trim());
    data.append("password", form.password);
    if (form.contactNumber) data.append("contactNumber", form.contactNumber);
    if (form.location) data.append("location", form.location);
    if (photo) data.append("profile", photo);

    setLoading(true);
    try {
      await register(data);
      if (role === "professional") {
        toast.success("Account created", {
          description: "Complete your professional profile in Settings so clients can find you.",
        });
      } else {
        toast.success("Account created. Welcome!");
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Join homeowners and professionals building across Nepal."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormError message={error} />

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">I am a…</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, title, subtitle, icon: Icon }) => (
              <label
                key={value}
                className={clsx(
                  "flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition",
                  role === value ? "border-brand bg-brand-soft" : "border-line hover:border-ink-faint"
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                  className="sr-only"
                />
                <Icon className={clsx("h-6 w-6", role === value ? "text-brand" : "text-ink-faint")} aria-hidden />
                <span>
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="block text-xs text-ink-soft">{subtitle}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-4">
          <label className="group relative grid h-16 w-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-line bg-muted hover:border-brand">
            {preview ? (
              <img src={preview} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-5 w-5 text-ink-faint group-hover:text-brand" aria-hidden />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              aria-label="Profile photo"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </label>
          <div className="text-sm">
            <p className="font-semibold">Profile photo <span className="font-normal text-ink-faint">(optional)</span></p>
            <p className="text-xs text-ink-faint">JPG, PNG or WEBP up to 5MB</p>
            {photo && (
              <button type="button" className="mt-1 text-xs font-semibold text-danger" onClick={() => { setPhoto(null); setPreview(""); }}>
                Remove
              </button>
            )}
          </div>
        </div>

        <Field label="Full name" error={errors.username}>
          <Input autoComplete="name" value={form.username} onChange={set("username")} />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" autoComplete="email" value={form.email} onChange={set("email")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone" optional>
            <Input type="tel" autoComplete="tel" placeholder="98XXXXXXXX" value={form.contactNumber} onChange={set("contactNumber")} />
          </Field>
          <Field label="Location" optional>
            <Input placeholder="Kathmandu" value={form.location} onChange={set("location")} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" error={errors.password} hint={!errors.password ? "At least 8 characters" : undefined}>
            <PasswordInput autoComplete="new-password" value={form.password} onChange={set("password")} />
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            <PasswordInput autoComplete="new-password" value={form.confirm} onChange={set("confirm")} />
          </Field>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create {role} account
        </Button>
      </form>
    </AuthShell>
  );
}
