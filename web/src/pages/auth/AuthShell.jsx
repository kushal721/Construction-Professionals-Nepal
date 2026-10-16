import { CheckCircle2 } from "lucide-react";

const POINTS = [
  "Browse ready-to-build house designs with real cost estimates",
  "Book consultations with verified architects and engineers",
  "Message professionals directly and keep everything in one place",
];

// Split auth layout: form on the left, photo with value props on the right (lg+).
export function AuthShell({ title, description, children, footer }) {
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="grid overflow-hidden rounded-2xl border border-line bg-surface shadow-card lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 text-sm text-ink-soft sm:text-base">{description}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-ink-soft">{footer}</div>}
          </div>
        </div>
        <div className="relative hidden min-h-[560px] lg:block">
          <img src="/auth.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="font-display text-2xl font-semibold leading-snug text-balance">
              “From the first sketch to the final brick, find the people who build Nepal.”
            </p>
            <ul className="mt-6 space-y-3">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-white/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A27F]" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
      {message}
    </div>
  );
}
