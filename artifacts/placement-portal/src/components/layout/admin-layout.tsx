import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "../theme-provider";
import { clearToken } from "@/lib/auth";
import { Briefcase, Building, GraduationCap, LayoutDashboard, LogOut, Moon, Sun, Bell, Settings } from "lucide-react";
import { Button } from "../ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Placement Portal</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/admin/students" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              <GraduationCap className="h-4 w-4" /> Students
            </Link>
            <Link href="/admin/companies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              <Building className="h-4 w-4" /> Companies
            </Link>
            <Link href="/admin/jobs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              <Briefcase className="h-4 w-4" /> Jobs
            </Link>
            <Link href="/admin/applications" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              <Settings className="h-4 w-4" /> Applications
            </Link>
            <Link href="/admin/notifications" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
              <Bell className="h-4 w-4" /> Notifications
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
