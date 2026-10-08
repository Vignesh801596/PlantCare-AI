import { Link } from "@tanstack/react-router";
import { Leaf, LayoutDashboard, ScanLine, History, Info } from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/detect", label: "Disease Detection", icon: ScanLine },
  { to: "/history", label: "Recognition History", icon: History },
  { to: "/about", label: "About Project", icon: Info },
] as const;

export function AppNav() {
  return (
    <aside className="border-b border-border bg-card md:min-h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex items-center gap-2 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Leaf className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">PlantCare AI</p>
          <p className="text-xs text-muted-foreground">Plant Disease Detection</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-6">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
