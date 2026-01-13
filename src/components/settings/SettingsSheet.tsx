import { useTheme } from 'next-themes';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your application preferences
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Appearance</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="dark-mode" className="cursor-pointer">
                  Dark Mode
                </Label>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            {/* Theme Buttons */}
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setTheme('system')}
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
