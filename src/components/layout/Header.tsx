import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
  const { clientName, logout } = useAuth();

  return (
    <div className="flex w-full items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Candidate Portal</h1>
        {clientName && (
          <p className="text-sm text-muted-foreground">{clientName}</p>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </Button>
    </div>
  );
}
