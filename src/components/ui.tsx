import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Button({
  variant = "solid",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" | "quiet" }) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40",
        variant === "solid" && "bg-brass text-ink",
        variant === "ghost" && "bg-transparent text-fg ring-1 ring-line",
        variant === "quiet" && "bg-raised text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function Chip({
  pressed,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pressed?: boolean }) {
  return (
    <button
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-10 items-center rounded-full px-3 text-sm transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]",
        pressed ? "bg-brass text-ink" : "bg-raised text-fg ring-1 ring-line",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={cn("rounded-2xl bg-paper p-4 ring-1 ring-line", className)}>
      {children}
    </section>
  );
}

export function PageHead({ kicker, title, lede }: { kicker?: string; title: string; lede?: string }) {
  return (
    <header className="rise">
      {kicker ? <p className="text-xs font-medium uppercase tracking-widest text-brass">{kicker}</p> : null}
      <h1 className="mt-1 font-display text-4xl text-fg">{title}</h1>
      {lede ? <p className="mt-3 text-base text-muted">{lede}</p> : null}
    </header>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

export const fieldClass =
  "h-11 w-full rounded-xl bg-bg px-3 text-base text-fg outline-none ring-1 ring-line focus:ring-brass";
