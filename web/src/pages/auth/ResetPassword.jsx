import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import { Button, ButtonLink, Field, PasswordInput } from "../../components/ui";
import { AuthShell, FormError } from "./AuthShell";

export default function ResetPassword() {
  const { id, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords don't match");
    setLoading(true);
    try {
      await api(`/auth/reset-password/${id}/${token}`, { method: "POST", body: { password } });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Choose a new password" description="Make it at least 8 characters and unique to this site.">
      {done ? (
        <div className="rounded-2xl border border-success/30 bg-success-soft p-6 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-success" aria-hidden />
          <p className="mt-3 font-semibold text-ink">Password updated</p>
          <p className="mt-1 text-sm text-ink-soft">You can now sign in with your new password.</p>
          <ButtonLink to="/login" className="mt-5">
            Sign in
          </ButtonLink>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <FormError message={error} />
          <Field label="New password">
            <PasswordInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Reset password
          </Button>
          <p className="text-center text-sm text-ink-soft">
            Link expired?{" "}
            <Link to="/forgot-password" className="link">
              Request a new one
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
