import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Your hiring pipeline overview" },
  "/candidates": { title: "Candidates", subtitle: "Review all candidates" },
  "/interviews": { title: "Interviews", subtitle: "Scheduled interview sessions" },
  "/selected": { title: "Selected", subtitle: "Selected & joined candidates" },
  "/new-job": { title: "Job Requests", subtitle: "Post and manage job openings" },
  "/my-company": { title: "My Company", subtitle: "Company profile & details" },
  "/settings": { title: "Settings", subtitle: "Account preferences" },
};

export function Header() {
  const { clientName } = useAuth();
  const location = useLocation();
  const page = pageTitles[location.pathname] ?? { title: "Dashboard" };

  // Derive initials from client name
  const initials = clientName
    ? clientName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'C';

  return (
    <div className="flex w-full items-center justify-between">
      <div>
        <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none">{page.title}</h1>
        {page.subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{page.subtitle}</p>
        )}
      </div>
      {clientName && (
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-foreground leading-none">{clientName}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Client Portal</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
            {initials}
          </div>
        </div>
      )}
    </div>
  );
}
