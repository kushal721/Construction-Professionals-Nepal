import { ButtonLink } from "../../components/ui";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-8xl font-semibold text-brand/25 sm:text-9xl" aria-hidden>
        404
      </p>
      <h1 className="-mt-4 text-3xl font-semibold sm:text-4xl">This page isn't built yet</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        The page you're looking for doesn't exist or may have moved. Let's get you back on solid ground.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/">Go home</ButtonLink>
        <ButtonLink to="/designs" variant="secondary">
          Browse designs
        </ButtonLink>
      </div>
    </div>
  );
}
