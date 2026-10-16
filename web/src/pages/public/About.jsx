import {
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  Heart,
  LayoutGrid,
  Lock,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  Upload,
} from "lucide-react";
import { ButtonLink, PageHeader } from "../../components/ui";

const CLIENT_STEPS = [
  { icon: Search, title: "Explore designs", text: "Filter by style, budget and floor area. Every design lists an estimated cost in rupees." },
  { icon: Heart, title: "Save your favourites", text: "Build a shortlist you can come back to and compare later." },
  { icon: MessageSquare, title: "Ask questions", text: "Message the designer directly to adapt a plan to your plot and budget." },
  { icon: CalendarClock, title: "Book a consultation", text: "Choose a time from their published availability and get a confirmation." },
];

const PRO_STEPS = [
  { icon: BadgeCheck, title: "Create your profile", text: "Add your specialization, experience, education and the skills clients search for." },
  { icon: Upload, title: "Publish designs", text: "Upload photos, area and cost estimates so clients can find your work." },
  { icon: CalendarClock, title: "Set availability", text: "Open consultation windows; clients book 30-minute slots inside them." },
  { icon: LayoutGrid, title: "Manage bookings", text: "Confirm, complete or cancel requests and keep the conversation in one inbox." },
];

const TRUST = [
  { icon: ShieldCheck, title: "Your data stays private", text: "Contact details are only visible to signed-in members, and conversations are visible only to the people in them." },
  { icon: Star, title: "Honest ratings", text: "One rating per member per design. Professionals can't rate their own work." },
  { icon: Lock, title: "Secure accounts", text: "Passwords are hashed and reset links expire after 15 minutes and work only once." },
];

const FAQ = [
  ["Is it free to use?", "Yes. Browsing, saving designs, messaging and booking consultations are free for clients. Professionals can publish designs and manage bookings at no cost."],
  ["How accurate are the cost estimates?", "Estimates are provided by the professional for the design as shown. Final costs depend on your plot, materials and current market rates — use the consultation to get a quote for your site."],
  ["Can a design be modified for my plot?", "Usually, yes. Message the designer with your plot size and orientation; most professionals adapt designs as part of a project."],
  ["What happens after I book?", "Your request appears as pending. The professional confirms or suggests another time, and you'll see the status update under My bookings."],
  ["Do designs follow the building code?", "Professionals are responsible for compliance. Many designs note NBC 105 seismic standards — ask the designer to confirm for your municipality."],
];

function StepList({ steps }) {
  return (
    <ol className="space-y-5">
      {steps.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className="flex gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-sans text-base font-bold">
              <span className="mr-1.5 text-ink-faint">{i + 1}.</span>
              {title}
            </h3>
            <p className="mt-0.5 text-sm text-ink-soft">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function About() {
  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="How it works"
        title="One place to plan, design and build"
        description="ConstructionPro connects families across Nepal with the architects, engineers, interior designers and contractors who'll bring their home to life."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6 sm:p-8" aria-labelledby="clients-heading">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">For homeowners</p>
          <h2 id="clients-heading" className="mb-6 mt-1 text-2xl font-semibold">
            Find the right design and the right people
          </h2>
          <StepList steps={CLIENT_STEPS} />
          <ButtonLink to="/register" className="mt-8">
            Create a free account
          </ButtonLink>
        </section>
        <section className="card p-6 sm:p-8" aria-labelledby="pros-heading">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">For professionals</p>
          <h2 id="pros-heading" className="mb-6 mt-1 text-2xl font-semibold">
            Grow your practice with clients ready to build
          </h2>
          <StepList steps={PRO_STEPS} />
          <ButtonLink to="/register?role=professional" variant="secondary" className="mt-8">
            Join as a professional
          </ButtonLink>
        </section>
      </div>

      <section className="mt-16" aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="text-2xl font-semibold sm:text-3xl">
          Built on trust
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line p-6">
              <Icon className="h-6 w-6 text-brand" aria-hidden />
              <h3 className="mt-3 font-sans text-base font-bold">{title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-center text-2xl font-semibold sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {q}
                <ChevronDown className="h-5 w-5 shrink-0 text-ink-faint transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
