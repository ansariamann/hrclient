import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { clientName } = useAuth();

  return (
    <div className="flex w-full items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Client Portal</h1>
        {clientName && (
          <p className="text-sm text-muted-foreground">{clientName}</p>
        )}
      </div>
    </div>
  );
}
