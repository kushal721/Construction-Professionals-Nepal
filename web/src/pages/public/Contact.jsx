import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Button, Field, Input, PageHeader, Textarea } from "../../components/ui";

const INFO = [
  { icon: MapPin, label: "Office", value: "Kathmandu, Nepal" },
  { icon: Mail, label: "Email", value: "hello@constructionpro.np", href: "mailto:hello@constructionpro.np" },
  { icon: Phone, label: "Phone", value: "+977 1-4000000", href: "tel:+97714000000" },
  { icon: Clock, label: "Hours", value: "Sun–Fri, 10 AM – 5 PM" },
];

export default function Contact() {
  const { user } = useAuth();
  const empty = { name: user?.username || "", email: user?.email || "", subject: "", message: "" };
  const [form, setForm] = useState(empty);
  const [sent, setSent] = useState(null);

  const send = useMutation({
    mutationFn: () => api("/contact", { method: "POST", body: form }),
    onSuccess: (res) => {
      setSent(res.message);
      setForm(empty);
    },
    onError: (err) => toast.error(err.message),
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Contact"
        title="We'd love to hear from you"
        description="Questions about a design, your account or partnering with us? Send a message and our team will reply within one working day."
      />

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center" role="status">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success">
                <CheckCircle2 className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="mt-4 font-sans text-xl font-bold">Message sent</h2>
              <p className="mt-1 max-w-sm text-sm text-ink-soft">{sent}</p>
              <Button variant="secondary" className="mt-6" onClick={() => setSent(null)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                send.mutate();
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name">
                  <Input value={form.name} onChange={set("name")} required autoComplete="name" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
                </Field>
              </div>
              <Field label="Subject" optional>
                <Input value={form.subject} onChange={set("subject")} placeholder="What's this about?" />
              </Field>
              <Field label="Message">
                <Textarea rows={6} value={form.message} onChange={set("message")} required maxLength={5000} />
              </Field>
              <Button type="submit" size="lg" loading={send.isPending}>
                Send message
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl">
            <img src="/auth.jpg" alt="" className="aspect-[16/9] w-full object-cover" />
          </div>
          <ul className="card divide-y divide-line">
            {INFO.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-center gap-4 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink-faint">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-semibold hover:text-brand">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
