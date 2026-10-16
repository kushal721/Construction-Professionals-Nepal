import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Button, Field, Input, PasswordInput } from "../../components/ui";
import { AuthShell, FormError } from "./AuthShell";
import { returnPath } from "../../components/layout/Guards";

const DEMO_ACCOUNTS = [
  { label: "Client", email: "client@cpn.test" },
  { label: "Professional", email: "sita@cpn.test" },
  { label: "Admin", email: "admin@cpn.test" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.username.split(" ")[0]}`);
      navigate(returnPath(location.state), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage your designs, bookings and messages."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormError message={error} />
        <Field label="Email">
          <Input
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            required
          />
        </Field>
        <Field
          label="Password"
          action={
            <Link to="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput autoComplete="current-password" value={form.password} onChange={set("password")} required />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      {import.meta.env.DEV && (
        <details className="group mt-6 rounded-xl border border-dashed border-line px-4 py-3 text-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink-soft">
            Demo accounts
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-2 text-xs text-ink-faint">
            Password for all: <code className="font-semibold text-ink">Password123</code>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <Button
                key={a.email}
                size="sm"
                variant="secondary"
                onClick={() => setForm({ email: a.email, password: "Password123" })}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </details>
      )}
    </AuthShell>
  );
}
