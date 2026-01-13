import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { SettingsSheet } from '@/components/settings/SettingsSheet';

export function Header() {
  const { clientName, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Candidate Portal</h1>
          {clientName && (
            <p className="text-sm text-muted-foreground">{clientName}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)} className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
