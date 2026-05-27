import { ShieldCheck } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import { LockVaultButton } from '@/features/lock-vault';

type AppSidebarProps = {
  onLock: () => void;
};

export function AppSidebar({ onLock }: AppSidebarProps) {
  return (
    <aside className="flex min-h-screen flex-col border-r bg-muted/30 p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-4" />
        </div>

        <div>
          <p className="text-sm font-semibold">Secure Vault</p>
          <p className="text-xs text-muted-foreground">Unlocked</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <Button variant="ghost" className="justify-start">
          All items
        </Button>
        <Button variant="ghost" className="justify-start">
          Logins
        </Button>
        <Button variant="ghost" className="justify-start">
          TOTP
        </Button>
        <Button variant="ghost" className="justify-start">
          Seed phrases
        </Button>
        <Button variant="ghost" className="justify-start">
          Secure notes
        </Button>
      </nav>

      <div className="mt-8 flex flex-col gap-1">
        <Button variant="ghost" className="justify-start">
          Security Center
        </Button>
        <Button variant="ghost" className="justify-start">
          Backup
        </Button>
        <Button variant="ghost" className="justify-start">
          Settings
        </Button>
      </div>

      <div className="mt-auto pt-8">
        <LockVaultButton onLocked={onLock} />
      </div>
    </aside>
  );
}
