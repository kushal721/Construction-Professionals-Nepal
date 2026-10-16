import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck, Mail } from "lucide-react";
import { api } from "../../lib/api";
import { Button, ButtonLink, Field, Input } from "../../components/ui";
import { AuthShell, FormError } from "./AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { message } = await api("/auth/forgot-password", { method: "POST", body: { email } });
      setSent(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter your account email and we'll send you a link to reset it."
      footer={
        <Link to="/login" className="link">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-success/30 bg-success-soft p-6 text-center">
          <MailCheck className="mx-auto h-8 w-8 text-success" aria-hidden />
          <p className="mt-3 font-semibold text-ink">Check your inbox</p>
          <p className="mt-1 text-sm text-ink-soft">{sent}. The link expires in 15 minutes.</p>
          <ButtonLink to="/login" variant="secondary" className="mt-5">
            Return to sign in
          </ButtonLink>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <FormError message={error} />
          <Field label="Email">
            <Input
              type="email"
              icon={Mail}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
