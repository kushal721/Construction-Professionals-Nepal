import { forwardRef, useId, useState, cloneElement, isValidElement } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

/**
 * <Field label="Email" hint="..." error="..."><Input /></Field>
 * Wires up id / aria attributes on the single child control.
 */
export function Field({ label, hint, error, children, className, optional, action }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })
    : children;
  return (
    <div className={clsx("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={children?.props?.id || id} className="text-sm font-semibold text-ink">
            {label}
            {optional && <span className="ml-1 font-normal text-ink-faint">(optional)</span>}
          </label>
          {action}
        </div>
      )}
      {control}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ className, icon: Icon, ...props }, ref) {
  if (!Icon) return <input ref={ref} className={clsx("field", className)} {...props} />;
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
      <input ref={ref} className={clsx("field pl-10", className)} {...props} />
    </div>
  );
});

export const PasswordInput = forwardRef(function PasswordInput({ className, ...props }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={show ? "text" : "password"} className={clsx("field pr-11", className)} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-faint hover:bg-muted hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={clsx("field resize-y", className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={clsx("field form-select pr-9", className)} {...props}>
      {children}
    </select>
  );
});
