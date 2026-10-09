import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarRange, House, Library, MessageSquare, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Today", icon: House, exact: true },
  { to: "/week", label: "Week", icon: CalendarRange, exact: false },
  { to: "/library", label: "Library", icon: Library, exact: false },
  { to: "/coach", label: "Coach", icon: MessageSquare, exact: false },
  { to: "/you", label: "You", icon: UserRound, exact: false },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <main className="mx-auto w-full max-w-lg px-4 pb-28 pt-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg pb-safe">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs",
                  active ? "text-brass" : "text-faint",
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
