import { ShieldCheck } from 'lucide-react';

import type { VaultList } from '@/features/vault-lists';
import { LockVaultButton } from '@/features/lock-vault';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

type AppSidebarProps = {
  vaultLists: VaultList[];
  selectedListId: string;
  onSelectList: (listId: string) => void;
  onLock: () => void;
};

const ALL_ITEMS_LIST_ID = 'all';

export function AppSidebar({
  vaultLists,
  selectedListId,
  onSelectList,
  onLock,
}: AppSidebarProps) {
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
        <Button
          type="button"
          variant={selectedListId === ALL_ITEMS_LIST_ID ? 'secondary' : 'ghost'}
          className={cn(
            'justify-start',
            selectedListId === ALL_ITEMS_LIST_ID && 'font-medium',
          )}
          onClick={() => onSelectList(ALL_ITEMS_LIST_ID)}
        >
          All items
        </Button>

        {vaultLists.length > 0 ? (
          vaultLists.map((list) => {
            const isSelected = list.id === selectedListId;

            return (
              <Button
                key={list.id}
                type="button"
                variant={isSelected ? 'secondary' : 'ghost'}
                className={cn('justify-start', isSelected && 'font-medium')}
                onClick={() => onSelectList(list.id)}
              >
                {list.name}
              </Button>
            );
          })
        ) : (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            No lists yet.
          </p>
        )}
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
