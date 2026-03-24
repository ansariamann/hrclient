import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/candidates": "Candidates",
  "/interviews": "Interviews",
  "/selected": "Selected",
  "/settings": "Settings",
};

export function Header() {
  const { clientName } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="flex w-full items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
        {clientName && (
          <p className="text-xs text-muted-foreground">{clientName}</p>
        )}
      </div>
    </div>
  );
}
