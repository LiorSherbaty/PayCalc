import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Users,
  Receipt,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sales", label: "Sales Entry", icon: ShoppingCart },
  { to: "/product-sales", label: "Product Sales", icon: Package },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

interface ISidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: ISidebarProps) {
  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-200",
          // Desktop: always visible
          "md:translate-x-0",
          // Mobile: slide in/out
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-3 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
            PC
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">PayCalc</h1>
            <p className="text-[11px] text-muted-foreground">
              Payment Calculator
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </aside>
    </>
  );
}
